import Category from "../model/categoryModel.js";
import Service from "../model/serviceModel.js";
import ServiceProvider from "../model/serviceProviderModel.js";
import { v2 as cloudinary } from "cloudinary";

const generateSlug = (name) => {
  return name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const uploadImages = async (files) => {
  const uploadPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "service-images" },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      );
      uploadStream.end(file.buffer);
    });
  });
  return await Promise.all(uploadPromises);
};

export const addService = async (req, res) => {
  try {
    const { name, description, priceInfo, categoryName, minPeople, maxPeople, mindaysprior, lat, lng } = req.body;

    if (!name || !priceInfo || !categoryName || !minPeople || !maxPeople) {
      return res.status(400).json({ success: false, msg: "All fields are required" });
    }
    
    const minP = Number(minPeople);
    const maxP = Number(maxPeople);
    const minDays = Number(mindaysprior || 0);
    
    let parsedPriceInfo;
    try {
      parsedPriceInfo = typeof priceInfo === 'string' ? JSON.parse(priceInfo) : priceInfo;
    } catch (err) {
      return res.status(400).json({ success: false, msg: "Invalid price format" });
    }

    if (minP > maxP) {
      return res.status(400).json({ success: false, msg: "Minimum People cannot be more than maximum people" });
    }
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, msg: "At least one image is required." });
    }

    // This now uploads the files and gets the full result
    const uploadedImages = await uploadImages(req.files);

    let category = await Category.findOne({ name: categoryName });
    if (!category) {
      category = await Category.create({ name: categoryName, slug: generateSlug(categoryName) });
    }

    const providerId = req.provider._id;
    
    const servicePayload = {
      name,
      description,
      images: uploadedImages, // Save the array of {url, public_id} objects
      priceInfo: parsedPriceInfo,
      categories: category._id,
      providers: providerId,
      minPeople: minP,
      maxPeople: maxP,
      mindaysprior: minDays
    };

    if (lat && lng) {
      servicePayload.exactLocation = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      };
    }

    const service = await Service.create(servicePayload);

    const provider = await ServiceProvider.findById(providerId);
    provider.services.push(service._id);
    await provider.save();

    category.services.push(service._id);
    await category.save();

    res.status(201).json({ success: true, msg: "Service created successfully", service });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


export const getServices = async (req, res) => {
  const services = await Service.find({})
    .populate('categories')
    .populate('providers');
  
 return res.status(201).send(services);
};


import UserHistory from "../model/userHistoryModel.js";

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('categories')
      .populate('providers');
      
    if (service) {
      // --- Track Visit for Recommendations ---
      const userId = req.user?._id || req.body?.userId || req.query?.userId;
      if (userId && service.providers) {
        await UserHistory.findOneAndUpdate(
          { userId },
          {
            $push: {
              visits: {
                $each: [{ 
                  providerId: service.providers._id, 
                  category: service.categories?.name,
                  timestamp: new Date() 
                }],
                $slice: -50
              }
            }
          },
          { upsert: true, new: true }
        ).catch(err => console.error('Tracking visit failed:', err.message));
      }
      // ---------------------------------------

      res.json({success:true,service});
    } else {
      res.status(404).json({success:false,msg:'Service not found'});
    }
  } catch (error) {
    res.status(500).json({success:false,msg:'Server error'});
  }
};

export const getServiceByName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        msg: "Service name is required.",
      });
    }

    // Case-insensitive search using regex
    const services = await Service.find({
      name: { $regex: new RegExp(name, "i") }, // 'i' = ignore case
    }).populate("categories providers");

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No services found with that name.",
      });
    }

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (err) {
    console.error("Error in getServiceByName:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error.",
    });
  }
};
 

export const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const providerId = req.provider._id;

    const service = await Service.findOne({ _id: serviceId, providers: providerId });
    if (!service) {
      return res.status(404).json({ success: false, msg: "Service not found or not authorized" });
    }

    // More robustly delete all images from Cloudinary in one API call
    if (service.images && service.images.length > 0) {
      const publicIds = service.images.map(img => img.public_id);
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
    }

    await Service.findByIdAndDelete(serviceId);

    await ServiceProvider.findByIdAndUpdate(providerId, { $pull: { services: serviceId } });
    await Category.findByIdAndUpdate(service.categories, { $pull: { services: serviceId } });

    res.status(200).json({ success: true, msg: "Service deleted successfully" });
  } catch (err) {
    console.error("Delete Service Error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export default {addService,getServices,deleteService};