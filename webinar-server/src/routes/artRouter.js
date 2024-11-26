import express from 'express';
import { authMiddleware } from '../helpers/middlewares.js';
import { dataArray, TAX_RATE } from '../services/artService.js';
import riskController from '../controllers/riskController.js';
import dbService from '../services/dbService.js';
import { REPORT_RESULTS } from '../helpers/constants.js';

const artRouter = express.Router();

artRouter.get('/all', authMiddleware, (_req, res) => {
  res
    .status(200)
    .json(dataArray.map(({ id, title, subtitle, price, imageUrl }) => ({ id, title, subtitle, price, imageUrl })));
});

artRouter.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const item = dataArray.find((item) => item.id === Number(id));
  if (item) {
    res.status(200).json(item);
  } else {
    res.status(404).json({ message: 'Artwork not found' });
  }
});

artRouter.post('/pre-checkout', authMiddleware, (req, res) => {
  const { items } = req.body;
  try {
    const subtotal = items.reduce((acc, { id, quantity }) => {
      const item = dataArray.find((item) => item.id === Number(id));
      return acc + item.price * quantity;
    }, 0);
    res.status(200).json({
      subtotal,
      taxRate: TAX_RATE,
      tax: (subtotal * TAX_RATE).toFixed(2),
      total: (subtotal * (1 + TAX_RATE)).toFixed(2),
    });
  } catch (error) {
    // Easy way to control wrong items
    console.log(`Error in pre-checkout: ${error}`);
    res.status(400).json({ message: 'Invalid request' });
  }
});

artRouter.post('/checkout', authMiddleware, async (req, res) => {
  const { purchase, cart, actionToken } = req.body;

  try {
    // Manage risk recommendation for purchase
    const recommendation = await riskController.manageRiskPurchase(actionToken);
    // Store the recommendation in the database
    await dbService.saveLastRiskRecommendation(req.locals.userid, recommendation);

    // Validate the purchase order is correct
    for (let item of Object.values(cart)) {
      const { id, price } = item;
      const itemData = dataArray.find((data) => data.id === Number(id));
      if (itemData.price !== price) {
        // Report the action result
        await riskController.reportCheckoutActionResult(actionToken, REPORT_RESULTS.FAILURE, req.locals.userid);

        return res.status(400).json({ message: 'Invalid cart' });
      }
    }
    // Report the action result
    await riskController.reportCheckoutActionResult(actionToken, REPORT_RESULTS.SUCCESS, req.locals.userid);

    // Store the order in the database
    await dbService.addPurchase(req.locals.userid, {
      purchase,
      cart,
    });

    res.status(200).json({ message: 'Checkout successful' });
  } catch (error) {
    // Report the action result
    await riskController.reportCheckoutActionResult(actionToken, REPORT_RESULTS.FAILURE, req.locals.userid);

    return res.status(401).json({ message: error.message });
  }
});

export default artRouter;
