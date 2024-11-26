import express from 'express';
import defaultCtlr from '../controllers/defaultController.js';
import passkeysController from '../controllers/passkeysController.js';
import { authMiddleware } from '../helpers/middlewares.js';
import riskController from '../controllers/riskController.js';
import dbService from '../services/dbService.js';
import { REPORT_RESULTS } from '../helpers/constants.js';

const defaultRouter = express.Router();

defaultRouter.get('/', (_req, res) => {
  res.send('Server API.\nPlease use POST /auth -or- POST /verify for authentication');
});

// The auth endpoint that logs a user based on an existing record
defaultRouter.post('/auth', async (req, res) => {
  const { email, password, actionToken } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Invalid request' });
  try {
    // Manage risk recommendation for login
    const recommendation = await riskController.manageRiskLogin(actionToken);

    // Authenticate user with email and password
    const token = await defaultCtlr.auth(email, password);

    // Report the action result
    await riskController.reportLoginPasswordActionResult(actionToken, REPORT_RESULTS.SUCCESS, email);

    // Store the recommendation in the database
    await dbService.saveLastRiskRecommendation(email, recommendation);

    return res.status(200).json({ message: 'success', token });
  } catch (error) {
    // Report the action result
    await riskController.reportLoginPasswordActionResult(actionToken, REPORT_RESULTS.FAILURE, email);

    return res.status(401).json({ message: error.message });
  }
});

// The register endpoint that creates a new user record
defaultRouter.post('/register', async (req, res) => {
  const { email, password, actionToken } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Invalid request' });
  try {
    // Manage risk recommendation for registration
    const recommendation = await riskController.manageRiskRegistration(actionToken);

    // Register the user with email and password
    const { token, userId } = await defaultCtlr.register(email, password);

    // Report the action result
    await riskController.reportSignUpPasswordActionResult(actionToken, REPORT_RESULTS.SUCCESS, email);

    // Store the recommendation in the database
    await dbService.saveLastRiskRecommendation(email, recommendation);

    return res.status(200).json({ message: 'success', token, userId });
  } catch (error) {
    // Report the action result
    await riskController.reportSignUpPasswordActionResult(actionToken, REPORT_RESULTS.FAILURE, email);

    return res.status(401).json({ message: error.message });
  }
});

// The auth-passkeys endpoint that authenticates a passkey
defaultRouter.post('/webauthn/auth', async (req, res) => {
  const { webauthnEncodedResult, actionToken, userId } = req.body;
  if (!webauthnEncodedResult) return res.status(400).json({ message: 'Invalid request' });
  try {
    // Manage risk recommendation for login
    const recommendation = await riskController.manageRiskLogin(actionToken);
    // Authenticate the user with the passkey
    const { token, userid } = await passkeysController.authUserPasskey(webauthnEncodedResult, userId);

    // Report the action result
    await riskController.reportLoginPasskeyActionResult(actionToken, REPORT_RESULTS.SUCCESS, userid);

    // Store the recommendation in the database
    await dbService.saveLastRiskRecommendation(userid, recommendation);

    return res.status(200).json({ message: 'success', token, email: userid });
  } catch (error) {
    // Report the action result
    await riskController.reportLoginPasskeyActionResult(actionToken, REPORT_RESULTS.FAILURE, userId);

    return res.status(401).json({ message: error.message });
  }
});

// The register-passkeys endpoint that registers a new passkey
defaultRouter.post('/webauthn/register', async (req, res) => {
  const { webauthnEncodedResult, actionToken, userId } = req.body;
  if (!webauthnEncodedResult || !userId) return res.status(400).json({ message: 'Invalid request' });
  try {
    // Manage risk recommendation for registration
    const recommendation = await riskController.manageRiskRegistration(actionToken);

    // Register the user with the passkey
    const token = await passkeysController.registerUserPasskey(webauthnEncodedResult, userId);

    // Report the action result
    await riskController.reportSignUpPasskeyActionResult(actionToken, REPORT_RESULTS.SUCCESS, userId);

    // Store the recommendation in the database
    await dbService.saveLastRiskRecommendation(userId, recommendation);

    return res.status(200).json({ message: 'success', token });
  } catch (error) {
    // Report the action result
    await riskController.reportSignUpPasskeyActionResult(actionToken, REPORT_RESULTS.FAILURE, userId);

    return res.status(401).json({ message: error.message });
  }
});

// Endpoint used when the user is already authenticated by an external service
// Implemented to be used after the user has been authenticated by Transmit Mosaic Orchestration Service
defaultRouter.post('/auth/external', async (req, res) => {
  // Get IDO JWT Token from the request
  const externalToken = req.body.token;
  if (!externalToken) return res.status(400).json({ message: 'Invalid request' });
  try {
    // Validate the token through the controller and
    // generate JWT token for the user
    const { token, userId } = await defaultCtlr.authExternal(externalToken);

    return res.status(200).json({ message: 'success', token, userId });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

// Endpoint used when the user is created by an external service
// Implemented to be used after the user has been created by Transmit Mosaic Orchestration Service
defaultRouter.post('/register/external', async (req, res) => {
  const { email, password, token: externalToken } = req.body;
  if (!email || !externalToken) return res.status(400).json({ message: 'Invalid request' });
  try {
    // Validate the token through the controller and
    // generate JWT token for the user
    const { token, userId } = await defaultCtlr.registerExternal(email, password, externalToken);

    // TODO: Pending -> Report the action result in IDO when it's working

    return res.status(200).json({ message: 'success', token, userId });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

// Verification endpoint that checks if a given JWT token is valid
// For debugging purposes, the token is passed in the Authorization header
defaultRouter.post('/verify', authMiddleware, (req, res) => {
  const tokenHeaderKey = process.env.JWT_HEADER.toLowerCase();
  const authToken = req.headers[tokenHeaderKey];
  try {
    // eslint-disable-next-line no-unused-vars
    const decodedToken = defaultCtlr.verify(authToken);
    return res.status(200).json({ status: 'logged in', message: 'success' });
  } catch (error) {
    // Access Denied
    return res.status(401).json({ status: 'invalid auth', message: error.message });
  }
});

export default defaultRouter;
