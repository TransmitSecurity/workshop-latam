import { dataArray } from '../services/artService.js';
import riskController from '../controllers/riskController.js';
import dbService from '../services/dbService.js';
import { REPORT_RESULTS } from '../helpers/constants.js';

/**
 * Process Purchase Order
 * @param {String} userid User ID
 * @param {Number} purchase Purchase amount
 * @param {Object} cart Cart items
 * @param {String} actionToken DRS Recommendation actionToken
 */
const processPurchaseOrder = async (userid, purchase, cart, actionToken) => {
  try {
    // Validate the purchase order is correct
    for (let item of Object.values(cart)) {
      const { id, price } = item;
      const itemData = dataArray.find((data) => data.id === Number(id));
      if (itemData.price !== price) {
        // Report the action result
        await riskController.reportCheckoutActionResult(actionToken, REPORT_RESULTS.FAILURE, userid);
        throw new Error('Invalid cart');
      }
    }
    // Report the action result
    await riskController.reportCheckoutActionResult(actionToken, REPORT_RESULTS.SUCCESS, userid);

    // Store the order in the database
    await dbService.addPurchase(userid, {
      purchase,
      cart,
    });
  } catch (error) {
    // Report the action result
    await riskController.reportCheckoutActionResult(actionToken, REPORT_RESULTS.FAILURE, userid);
    throw new Error(error.message);
  }
};

export default { processPurchaseOrder };
