import express from 'express';
import { authMiddleware } from '../helpers/middlewares.js';
import { dataArray, TAX_RATE } from '../services/artService.js';
import riskController from '../controllers/riskController.js';
import artController from '../controllers/artController.js';
import dbService from '../services/dbService.js';
import { validateIDOToken } from '../services/transmitService.js';

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

/**
 * Checkout endpoint implementation for both internal and external orchestration
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {Boolean} isExternal whether purchase is based on orquestration or not
 * @returns response
 */
const checkout = async (req, res, isExternal) => {
  let { purchase, cart, actionToken } = req.body;

  // If isExternal, the param sent is the token not the actionToken
  if (isExternal) {
    const decodedIdoToken = await validateIDOToken(actionToken);
    actionToken = decodedIdoToken.actionToken;
  }

  try {
    if (!isExternal) {
      // Manage risk recommendation for purchase
      const recommendation = await riskController.manageRiskPurchase(actionToken);

      // Store the recommendation in the database
      await dbService.saveLastRiskRecommendation(req.locals.userid, recommendation);
    }

    // Process the purchase order
    await artController.processPurchaseOrder(req.locals.userid, purchase, cart, actionToken);

    return res.status(200).json({ message: 'Checkout successful' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Checkout endpoint
artRouter.post('/checkout', authMiddleware, async (req, res) => {
  return checkout(req, res, false);
});

// Checkout endpoint used for external orchestration based purchase
artRouter.post('/checkout/external', authMiddleware, async (req, res) => {
  return checkout(req, res, true);
});

export default artRouter;
