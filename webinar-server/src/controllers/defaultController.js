import jwt from 'jsonwebtoken';
import dbService from '../services/dbService.js';
import { bcryptCompareSync, bcryptHashSync, signSessionJWT } from '../helpers/cryptoHelper.js';
import { ERROR_AUTHENTICATION, ERROR_JWT_AUTHN, ERROR_REGISTRATION } from '../helpers/constants.js';
import { validateIDOToken } from '../services/transmitService.js';

/**
 * Authenticate a user with a given userid and password
 * @param {String} userid
 * @param {String} password
 * @returns JWT token for the user
 */
const auth = async (userid, password) => {
  // Look up the user entry in the database
  const user = dbService.getUserByUserId(userid);

  // If found, compare the hashed passwords and generate the JWT token for the user
  if (user) {
    try {
      await bcryptCompareSync(password, user.password);
      const token = signSessionJWT(userid);
      return token;
    } catch (error) {
      console.log(`Error authenticating user: passwd comparison fail: ${error.message}`);
      throw new Error(ERROR_AUTHENTICATION);
    }
  } else {
    console.log('Error authenticating user: user not found');
    throw new Error(ERROR_AUTHENTICATION);
  }
};

/**
 * Create a new user with a given userid and password
 * @param {String} userid
 * @param {String} password (optional)
 * @returns JWT token for the user
 */
const register = async (userid, password) => {
  try {
    const user = { userid };
    if (password) {
      const hash = await bcryptHashSync(password);
      user.password = hash;
    }
    console.log(`Creating user: ${JSON.stringify(user)}`);
    // NOTE: For simplicity, we are not checking for duplicate user entries
    // In a production system, you would check if the user already exists
    // and in case of a duplicate, return an error to the client offering
    // mechanisms to recover the account, contact support, etc.
    await dbService.addUser(user);

    const token = signSessionJWT(userid);
    console.log(`User created successfully: ${userid}, token: ${token}`);
    return { token, userId: userid };
  } catch (error) {
    console.log(`Error creating user: ${error.message}`);
    throw new Error(ERROR_REGISTRATION);
  }
};

/**
 * Verify a given Bearer authentication header value
 * For debug purposes, the token is passed in the Authorization header
 * This logic is already present in the authMiddleware
 * @param {String} authHeader Bearer token
 * @returns Decoded JWT token
 */
const verify = (authHeader) => {
  if (!authHeader || !authHeader.startsWith(`${process.env.JWT_TYPE} `)) {
    console.log(`Invalid JWT token: ${authHeader}`);
    throw new Error(ERROR_JWT_AUTHN);
  }
  const authToken = authHeader.split(' ')[1];
  try {
    const verified = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    if (verified) {
      console.log(`JWT token verified: ${verified}`);
      return verified;
    } else {
      console.log(`JWT token verification failed: ${authToken}`);
      throw new Error(ERROR_JWT_AUTHN);
    }
  } catch (error) {
    console.log(`JWT token verification error: ${error.message}`);
    throw new Error(ERROR_JWT_AUTHN);
  }
};

/**
 * Verifies the orchestration token generated by the Transmit IDO SDK
 * @param {String} orchestrationToken Token generated by the Transmit IDO SDK after journey completion
 * @returns Session JWT token for the user
 */
const authExternal = async (orchestrationToken) => {
  try {
    // Verify the token signature
    const decoded = await validateIDOToken(orchestrationToken);
    console.log(JSON.stringify(decoded, null, 2)); // TODO: for visibility only, remove in production

    const externalUserId = decoded.external_user_id;
    // Look up the user entry in the database
    const user = dbService.getUserByUserId(externalUserId);
    if (!user) {
      console.log('Error authenticating user: user not found');
      throw new Error(ERROR_AUTHENTICATION);
    }

    const token = signSessionJWT(externalUserId);
    return { token, userId: externalUserId };
  } catch (error) {
    console.log(`Orchestration verification error: ${error.message}`);
    throw new Error(ERROR_AUTHENTICATION);
  }
};

/**
 * Registers a new user with the Transmit IDO SDK orchestration token
 * @param {String} userid
 * @param {String} password
 * @param {String} orchestrationToken Token generated by the Transmit IDO SDK after journey completion
 * @returns Session JWT token for the user
 */
const registerExternal = async (userid, password, orchestrationToken) => {
  try {
    // Verify the token signature
    const decoded = await validateIDOToken(orchestrationToken);
    console.log(JSON.stringify(decoded, null, 2)); // TODO: for visibility only, remove in production

    if (userid !== decoded.external_user_id) {
      console.log('Error registering user: user ID mismatch');
      throw new Error(ERROR_REGISTRATION);
    }

    return await register(userid, password);
  } catch (error) {
    console.log(`Orchestration verification error: ${error.message}`);
    throw new Error(ERROR_REGISTRATION);
  }
};

export default { auth, verify, register, authExternal, registerExternal };
