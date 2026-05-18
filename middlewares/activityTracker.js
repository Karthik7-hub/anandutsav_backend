import UserHistory from '../model/userHistoryModel.js';
import jwt from 'jsonwebtoken';

/**
 * Helper to safely extract user ID from various request sources (auth header, cookie, body, or query)
 */
const tryGetUserId = (req) => {
  if (req.user?._id) return req.user._id.toString();
  if (req.body?.userId) return req.body.userId.toString();
  if (req.query?.userId) return req.query.userId.toString();

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id;
    } catch (err) {
      // Unauthenticated / expired token, ignore quietly
    }
  }
  return null;
};

/**
 * Middleware to track user searches
 * @param {String} queryParamName - The name of the query parameter or body field containing the search term
 */
export const trackSearch = (queryParamName = 'q') => async (req, res, next) => {
  try {
    const userId = tryGetUserId(req);
    const query = req.query[queryParamName] || req.body[queryParamName];

    if (userId && query) {
      await UserHistory.findOneAndUpdate(
        { userId },
        {
          $push: {
            searches: {
              $each: [{ query, timestamp: new Date() }],
              $slice: -50 // Keep only the last 50 searches
            }
          }
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error tracking search:', error.message);
  } finally {
    next();
  }
};

/**
 * Middleware to track provider visits
 * @param {String} providerIdParam - The route param containing the provider ID
 */
export const trackProviderVisit = (providerIdParam = 'id') => async (req, res, next) => {
  try {
    const userId = tryGetUserId(req);
    const providerId = req.params[providerIdParam];

    if (userId && providerId) {
      await UserHistory.findOneAndUpdate(
        { userId },
        {
          $push: {
            visits: {
              $each: [{ providerId, timestamp: new Date() }],
              $slice: -50 // Keep only the last 50 visits
            }
          }
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error tracking provider visit:', error.message);
  } finally {
    next();
  }
};
