import mongoose from 'mongoose';
import User from '../model/userModel.js';
import ServiceProvider from '../model/serviceProviderModel.js';
import UserHistory from '../model/userHistoryModel.js';
import Service from '../model/serviceModel.js';
import Category from '../model/categoryModel.js';

// Helper: Calculate haversine distance (rough scoring) or use MongoDB $geoNear
// Since we use MongoDB $geoNear, we will build an aggregation pipeline.

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';

export const getSmartHomeFeed = async (req, res) => {
  try {
    const userId = req.user?._id || req.body?.userId;
    const { lat, lng, maxDistanceKm = 50 } = req.query; // User's current location from frontend

    let recommendedForYou = [];
    let nearbyServices = [];
    let trendingInCity = [];
    let basedOnSearches = [];
    let similarUsersBooked = [];
    let topRatedNearby = [];

    // 1. Nearby Services & Top Rated Nearby
    if (lat && lng) {
      const coordinates = [parseFloat(lng), parseFloat(lat)];
      
      const nearbyPipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates },
            distanceField: "distance",
            maxDistance: parseFloat(maxDistanceKm) * 1000, // convert km to meters
            spherical: true
          }
        },
        { $limit: 40 }
      ];
      
      const nearbyResults = await Service.aggregate(nearbyPipeline);
      const populatedResults = await Service.populate(nearbyResults, { path: 'categories providers' });
      
      nearbyServices = populatedResults.slice(0, 10);
      
      // Top Rated Nearby
      topRatedNearby = [...populatedResults].sort((a, b) => b.avgRating - a.avgRating).slice(0, 10);
      
      // Trending in City (Using reviewCount as a proxy for activity/popularity)
      trendingInCity = [...populatedResults].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10);
    } else {
      // Fallback if no location provided
      topRatedNearby = await Service.find().populate('categories providers').sort({ avgRating: -1 }).limit(10);
      trendingInCity = await Service.find().populate('categories providers').sort({ reviewCount: -1 }).limit(10);
    }

    let guestSearches = [];
    if (req.query.recentSearches) {
      try {
        guestSearches = JSON.parse(req.query.recentSearches);
      } catch (e) {}
    }

    let searchesToUse = [];
    let visitsToUse = [];
    let preferredCategories = [];

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        preferredCategories = user.preferredCategories || [];
      }
      const history = await UserHistory.findOne({ userId });
      if (history) {
        if (history.searches) {
          searchesToUse = history.searches.map(s => s.query);
        }
        if (history.visits) {
          visitsToUse = history.visits;
        }
      }
    } else {
      searchesToUse = guestSearches;
    }

    // 2. Based on Searches (Content-Based)
    if (searchesToUse && searchesToUse.length > 0) {
      const recentSearches = searchesToUse.slice(-5).filter(Boolean);
      const searchRegexes = recentSearches.map(q => new RegExp(q.trim(), 'i'));
      const matchedCategories = await Category.find({
        $or: [
          { name: { $in: searchRegexes } },
          { slug: { $in: searchRegexes } }
        ]
      });
      const matchedCatIds = matchedCategories.map(c => c._id);
      
      basedOnSearches = await Service.find({
        $or: [
          { categories: { $in: matchedCatIds } },
          { name: { $regex: recentSearches.map(q => q.trim()).join('|'), $options: 'i' } },
          { description: { $regex: recentSearches.map(q => q.trim()).join('|'), $options: 'i' } }
        ]
      }).populate('categories providers').limit(10);
    }

    // 3. Recommended for You (Hybrid: Content + Interactions)
    if (visitsToUse && visitsToUse.length > 0) {
      const visitedCategories = visitsToUse.map(v => v.category).filter(Boolean);
      preferredCategories = [...new Set([...preferredCategories, ...visitedCategories])];
    }
    if (searchesToUse && searchesToUse.length > 0) {
      preferredCategories = [...new Set([...preferredCategories, ...searchesToUse])];
    }

    if (preferredCategories.length > 0) {
      const searchRegexes = preferredCategories.map(q => new RegExp(q.trim(), 'i'));
      const preferredCats = await Category.find({
        $or: [
          { name: { $in: preferredCategories } },
          { name: { $in: searchRegexes } },
          { slug: { $in: searchRegexes } }
        ]
      });
      const preferredCatIds = preferredCats.map(c => c._id);

      // Try getting Content-Based recommendations from ML backend based on user's last visited service
      let mlContentSuccess = false;
      try {
        const lastVisited = visitsToUse && visitsToUse.length > 0 ? visitsToUse[visitsToUse.length - 1] : null;
        if (lastVisited && lastVisited.serviceId) {
          const mlResponse = await fetch(`${ML_API_URL}/recommend/content-based?service_id=${lastVisited.serviceId.toString()}&top_n=10`);
          if (mlResponse.ok) {
            const mlData = await mlResponse.json();
            if (mlData && Array.isArray(mlData.recommendations)) {
              const mlItemIds = mlData.recommendations.map(r => r.item?._id).filter(Boolean);
              if (mlItemIds.length > 0) {
                recommendedForYou = await Service.find({ _id: { $in: mlItemIds } }).populate('categories providers');
                mlContentSuccess = true;
              }
            }
          }
        }
      } catch (mlErr) {
        console.error("ML Content-Based Filtering failed, falling back to local database query:", mlErr);
      }

      if (!mlContentSuccess) {
        recommendedForYou = await Service.find({
          categories: { $in: preferredCatIds }
        }).populate('categories providers').sort({ avgRating: -1, reviewCount: -1 }).limit(10);
      }
    }

    if (userId) {
      const history = await UserHistory.findOne({ userId });
      if (history) {

        // 4. Collaborative Filtering (People who booked what you booked)
        let mlCollabSuccess = false;
        try {
          const mlResponse = await fetch(`${ML_API_URL}/recommend/collaborative/user-based?target_user=${userId.toString()}&top_n=10`);
          if (mlResponse.ok) {
            const mlData = await mlResponse.json();
            if (mlData && Array.isArray(mlData.recommendations)) {
              const mlItemIds = mlData.recommendations.map(r => r.item?._id).filter(Boolean);
              if (mlItemIds.length > 0) {
                similarUsersBooked = await Service.find({ _id: { $in: mlItemIds } }).populate('categories providers');
                mlCollabSuccess = true;
              }
            }
          }
        } catch (mlErr) {
          console.error("ML Collaborative Filtering failed, falling back to local database query:", mlErr);
        }

        if (!mlCollabSuccess) {
          if (history.bookings && history.bookings.length > 0) {
            const userBookedProviderIds = history.bookings.map(b => b.providerId);
            
            // Find other users who booked these providers
            const similarHistories = await UserHistory.find({
              'bookings.providerId': { $in: userBookedProviderIds },
              userId: { $ne: userId }
            });
            
            const coBookedProviderIds = similarHistories.reduce((acc, h) => {
              const ids = h.bookings.map(b => b.providerId.toString());
              return acc.concat(ids);
            }, []);

            // Filter out already booked by this user and count frequencies
            const recommendedProviderIds = coBookedProviderIds.filter(id => !userBookedProviderIds.includes(id));
            
            // Get unique top providers
            const uniqueRecIds = [...new Set(recommendedProviderIds)].slice(0, 10);
            similarUsersBooked = await Service.find({ providers: { $in: uniqueRecIds } })
              .populate('categories providers')
              .limit(10);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        recommendedForYou,
        nearbyServices,
        trendingInCity,
        basedOnSearches,
        similarUsersBooked,
        topRatedNearby
      }
    });

  } catch (error) {
    console.error('Error in getSmartHomeFeed:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * Location-based search / discovery with filters
 */
export const searchProviders = async (req, res) => {
  try {
    const { 
      q, 
      lat, 
      lng, 
      maxDistanceKm = 50, 
      categories, 
      tags, 
      eventTypes,
      minPrice,
      maxPrice,
      sortBy = 'distance' // 'distance', 'rating', 'popularity'
    } = req.query;

    const pipeline = [];

    // 1. Geo Near (MUST be the first stage in pipeline)
    if (lat && lng) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          maxDistance: parseFloat(maxDistanceKm) * 1000,
          spherical: true
        }
      });
    }

    // 2. Match Filters
    const matchStage = {};
    if (q) {
      // Fuzzy match name or tags
      matchStage.$or = [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { categories: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (categories) matchStage.categories = { $in: categories.split(',') };
    if (tags) matchStage.tags = { $in: tags.split(',') };
    if (eventTypes) matchStage.eventTypes = { $in: eventTypes.split(',') };
    if (minPrice || maxPrice) {
      matchStage['pricingRanges.min'] = { $gte: minPrice ? parseInt(minPrice) : 0 };
      if (maxPrice) matchStage['pricingRanges.max'] = { $lte: parseInt(maxPrice) };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 3. Sorting
    if (sortBy === 'rating') {
      pipeline.push({ $sort: { averageRating: -1 } });
    } else if (sortBy === 'popularity') {
      pipeline.push({ $sort: { popularityScore: -1 } });
    } else if (!lat || !lng) {
      // Fallback sort if distance isn't available
      pipeline.push({ $sort: { createdAt: -1 } });
    } // If sortBy === 'distance' and we have lat/lng, $geoNear already sorts by distance

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const results = await ServiceProvider.aggregate(pipeline);

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('Error in searchProviders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
