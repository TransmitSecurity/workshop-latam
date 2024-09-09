import { ERROR_RISK_DENY, ERROR_RISK_INVALID_ACTION_TOKEN, RECOMMENDATIONS } from '../helpers/constants.js';
import { getDRSClientAccessToken, getDRSRecommendation } from '../services/transmitService.js';

/**
 * Gets risk recommendation from DRS for the provided action token
 * @param {String} actionToken DRS action token
 * @returns Risk recommendation (JSON)
 */
const getRiskRecommendation = async (actionToken) => {
  // Validate action token
  if (!actionToken) {
    console.log(ERROR_RISK_INVALID_ACTION_TOKEN);
    console.log(`Action Token: ${actionToken}`);
    throw new Error(ERROR_RISK_INVALID_ACTION_TOKEN);
  }

  // Get risk recommendation
  try {
    const riskClientAccessToken = await getDRSClientAccessToken();
    return await getDRSRecommendation(actionToken, riskClientAccessToken);
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};

/**
 * Manages risk for login
 * @param {String} actionToken DRS action token
 * @returns recommendation
 * @throws Error based on the recommendation (only for DENY)
 */
const manageRiskLogin = async (actionToken) => {
  try {
    const recommendation = await getRiskRecommendation(actionToken);
    console.log(recommendation); // TODO: for visibility only, remove in production

    // Login Business Logic:
    //   Only deny login if recommendation is DENY, otherwise continue
    if (recommendation.recommendation.type === RECOMMENDATIONS.DENY) {
      throw new Error(ERROR_RISK_DENY);
    }
    return recommendation;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};

export default { manageRiskLogin };
