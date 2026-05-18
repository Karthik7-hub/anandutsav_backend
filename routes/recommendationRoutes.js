import express from 'express';
import { getSmartHomeFeed, searchProviders } from '../controller/recommendationController.js';
import { trackSearch } from '../middlewares/activityTracker.js';

// Assuming you have an auth middleware, we could use it optionally to get req.user
// import userAuth from '../middlewares/userAuth.js'; 

const recommendationRouter = express.Router();

// Get personalized home feed
recommendationRouter.get('/feed', getSmartHomeFeed);

// Search and discover providers (with tracking)
recommendationRouter.get('/search', trackSearch('q'), searchProviders);

export default recommendationRouter;
