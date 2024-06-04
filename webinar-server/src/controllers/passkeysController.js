import jwt from 'jsonwebtoken';
import dbService from '../services/dbService.js';
import {
  ERROR_AUTHENTICATION,
  ERROR_PASSKEY_AUTHENTICATION,
  ERROR_PASSKEY_REGISTRATION,
  ERROR_USER_EXISTS,
} from '../helpers/constants.js';
import { authPasskey, getClientAccessToken, registerPasskey, validateToken } from '../services/transmitService.js';

/**
 * Register a new user with Passkey credentials
 * @param {String} webauthnEncodedResult Webauthn encoded result returned by register() SDK call
 * @param {String} userid User identifier
 * @returns JWT token for the user
 */
const registerUserPasskey = async (webauthnEncodedResult, userid) => {
  try {
    // Check if user already exists
    if (dbService.getUserByUserId(userid)) {
      console.log(`User ${userid} already exists`);
      throw new Error(ERROR_USER_EXISTS);
    }

    // Register Passkey
    const clientAccessToken = await getClientAccessToken();
    const passkeyInfo = await registerPasskey(webauthnEncodedResult, userid, clientAccessToken);
    // Save user in database
    console.log({ userid, passkeyInfo });
    await dbService.addUser({ userid, passkeyInfo });

    const loginData = {
      userid,
      signInTime: Date.now(),
    };

    const token = jwt.sign(loginData, process.env.JWT_SECRET_KEY);
    console.log(`User created successfully: ${userid}, token: ${token}`);
    return token;
  } catch (error) {
    console.error(`${ERROR_PASSKEY_REGISTRATION}: ${error.message}`);
    throw new Error(`${ERROR_PASSKEY_REGISTRATION}: ${error.message}`);
  }
};

/**
 * Authenticate a user with Passkey credentials
 * @param {String} webauthnEncodedResult Webauthn encoded result returned by authenticate() SDK call
 * @param {String} userid User identifier (optional)
 * @returns JWT token for the user
 */
const authUserPasskey = async (webauthnEncodedResult, userid) => {
  try {
    // Authenticate with Passkey first
    const clientAccessToken = await getClientAccessToken();
    const authInfo = await authPasskey(webauthnEncodedResult, clientAccessToken);
    console.log(`User authenticated: ${JSON.stringify(authInfo, null, 2)}`);

    // If no userid is provided, look up the userid from the authInfo (id_token)
    if (!userid) {
      const { id_token } = authInfo;
      const decodedToken = await validateToken(id_token);
      console.log(`Decoded id_token: ${JSON.stringify(decodedToken, null, 2)}`);
      userid = decodedToken?.webauthn?.username;

      if (!userid) {
        console.error('Error authenticating user: user not found');
        throw new Error(ERROR_AUTHENTICATION);
      }
    }

    // Look up the user entry in the database
    const user = dbService.getUserByUserId(userid);
    if (!user) {
      console.error('Error authenticating user: user not found');
      throw new Error(ERROR_AUTHENTICATION);
    }

    const loginData = {
      userid,
      signInTime: Date.now(),
    };

    const token = jwt.sign(loginData, process.env.JWT_SECRET_KEY);
    return { token, userid };
  } catch (error) {
    console.error(`${ERROR_PASSKEY_AUTHENTICATION}: ${error.message}`);
    throw new Error(ERROR_PASSKEY_AUTHENTICATION);
  }
};

export default { registerUserPasskey, authUserPasskey };
