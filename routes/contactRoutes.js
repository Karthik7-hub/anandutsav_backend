import express from 'express';
import { handleContactForm, handleFraudReport } from '../controller/contactController.js';

const contactRouter = express.Router();

contactRouter.post('/send', handleContactForm);
contactRouter.post('/report-fraud', handleFraudReport);

export default contactRouter;
