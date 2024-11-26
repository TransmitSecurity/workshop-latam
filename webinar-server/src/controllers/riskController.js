import {
  ERROR_RISK_DENY,
  ERROR_RISK_INVALID_ACTION_TOKEN,
  RECOMMENDATIONS,
  REPORT_CHALLENGE_TYPE,
} from '../helpers/constants.js';
import { getDRSClientAccessToken, getDRSRecommendation, reportDRSActionResult } from '../services/transmitService.js';

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

/**
 * Manages risk for registration
 * @param {String} actionToken DRS action token
 * @returns recommendation
 * @throws Error based on the recommendation (only for DENY)
 */
const manageRiskRegistration = async (actionToken) => {
  try {
    const recommendation = await getRiskRecommendation(actionToken);
    console.log(recommendation); // TODO: for visibility only, remove in production

    // Registration Business Logic:
    //   Only deny login if recommendation is DENY, otherwise continue
    // TODO: add logic to step up customer registration if recommendation is CHALLENGE
    if (recommendation.recommendation.type === RECOMMENDATIONS.DENY) {
      throw new Error(ERROR_RISK_DENY);
    }
    return recommendation;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};

/**
 * Manages risk for purchase
 * @param {String} actionToken DRS action token
 * @returns recommendation
 * @throws Error based on the recommendation (only for DENY)
 */
const manageRiskPurchase = async (actionToken) => {
  try {
    const recommendation = await getRiskRecommendation(actionToken);
    console.log(recommendation); // TODO: for visibility only, remove in production

    // Purchase Business Logic:
    //   Only deny purchase if recommendation is DENY, otherwise continue
    // TODO: add logic to step up customer authentication if recommendation is CHALLENGE
    if (recommendation.recommendation.type === RECOMMENDATIONS.DENY) {
      throw new Error(ERROR_RISK_DENY);
    }
    return recommendation;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};

/**
 * Report Action Result after triggerActionEvent
 * @param {String} actionToken Action Token
 * @param {String} result Action result to report
 * @param {String} userId (Optional) User Identifier
 * @param {String} challengeType (Optional) Challenge Type
 * @returns report response JSON
 */
const reportActionResult = async (actionToken, result, userId = null, challengeType = null) => {
  try {
    const riskClientAccessToken = await getDRSClientAccessToken();
    const repRes = await reportDRSActionResult(actionToken, result, riskClientAccessToken, userId, challengeType);
    return repRes;
  } catch (error) {
    console.error(error.message);
    //throw new Error(error.message); // Not throwing error to allow the action to continue
  }
};

/**
 * Report Action Result for login with password
 * @param {String} actionToken Action Token
 * @param {String} result Action result to report
 * @param {String} userId (Optional) User Identifier
 * @returns report response JSON
 */
const reportLoginPasswordActionResult = async (actionToken, result, userId = null) => {
  return await reportActionResult(actionToken, result, userId, REPORT_CHALLENGE_TYPE.PASSWORD);
};

/**
 * Report Action Result for login with passkey
 * @param {String} actionToken Action Token
 * @param {String} result Action result to report
 * @param {String} userId (Optional) User Identifier
 * @returns report response JSON
 */
const reportLoginPasskeyActionResult = async (actionToken, result, userId = null) => {
  return await reportActionResult(actionToken, result, userId, REPORT_CHALLENGE_TYPE.PASSKEY);
};

/**
 * Report Action Result for registration with password
 * @param {String} actionToken Action Token
 * @param {String} result Action result to report
 * @param {String} userId (Optional) User Identifier
 * @returns report response JSON
 */
const reportSignUpPasswordActionResult = async (actionToken, result, userId = null) => {
  return await reportActionResult(actionToken, result, userId, REPORT_CHALLENGE_TYPE.PASSWORD);
};

/**
 * Report Action Result for registration with passkey
 * @param {String} actionToken Action Token
 * @param {String} result Action result to report
 * @param {String} userId (Optional) User Identifier
 * @returns report response JSON
 */
const reportSignUpPasskeyActionResult = async (actionToken, result, userId = null) => {
  return await reportActionResult(actionToken, result, userId, REPORT_CHALLENGE_TYPE.PASSKEY);
};

/**
 * Report Action Result for checkout without any challenge
 * @param {String} actionToken Action Token
 * @param {String} result Action result to report
 * @param {String} userId (Optional) User Identifier
 * @returns report response JSON
 */
const reportCheckoutActionResult = async (actionToken, result, userId = null) => {
  return await reportActionResult(actionToken, result, userId);
};

export default {
  manageRiskLogin,
  manageRiskRegistration,
  manageRiskPurchase,
  reportLoginPasswordActionResult,
  reportLoginPasskeyActionResult,
  reportSignUpPasswordActionResult,
  reportSignUpPasskeyActionResult,
  reportCheckoutActionResult,
};
