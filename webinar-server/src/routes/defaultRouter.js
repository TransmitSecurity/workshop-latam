import express from 'express';
import defaultCtlr from '../controllers/defaultController.js';
import passkeysController from '../controllers/passkeysController.js';
import { authMiddleware } from '../helpers/middlewares.js';

const defaultRouter = express.Router();

defaultRouter.get('/', (_req, res) => {
  res.send('Server API.\nPlease use POST /auth -or- POST /verify for authentication');
});

// The auth endpoint that logs a user based on an existing record
defaultRouter.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Invalid request' });
  try {
    const token = await defaultCtlr.auth(email, password);
    return res.status(200).json({ message: 'success', token });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

// The register endpoint that creates a new user record
defaultRouter.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Invalid request' });
  try {
    const token = await defaultCtlr.register(email, password);
    return res.status(200).json({ message: 'success', token });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

// The auth-passkeys endpoint that authenticates a passkey
defaultRouter.post('/webauthn/auth', async (req, res) => {
  const { webauthnEncodedResult, userId } = req.body;
  if (!webauthnEncodedResult) return res.status(400).json({ message: 'Invalid request' });
  try {
    const { token, userid } = await passkeysController.authUserPasskey(webauthnEncodedResult, userId);
    return res.status(200).json({ message: 'success', token, email: userid });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

// The register-passkeys endpoint that registers a new passkey
defaultRouter.post('/webauthn/register', async (req, res) => {
  const { webauthnEncodedResult, userId } = req.body;
  if (!webauthnEncodedResult || !userId) return res.status(400).json({ message: 'Invalid request' });
  try {
    const token = await passkeysController.registerUserPasskey(webauthnEncodedResult, userId);
    return res.status(200).json({ message: 'success', token });
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
