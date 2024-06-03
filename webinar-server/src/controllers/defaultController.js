import jwt from 'jsonwebtoken';
import dbService from '../services/dbService.js';
import { bcryptCompareSync, bcryptHashSync } from '../helpers/cryptoHelper.js';
import { ERROR_AUTHENTICATION, ERROR_JWT_AUTHN, ERROR_REGISTRATION } from '../helpers/constants.js';

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
      let loginData = {
        userid,
        signInTime: Date.now(),
      };

      const token = jwt.sign(loginData, process.env.JWT_SECRET_KEY);
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
 * @param {String} password
 * @returns JWT token for the user
 */
const register = async (userid, password) => {
  try {
    const hash = await bcryptHashSync(password);
    console.log({ userid, password: hash });
    await dbService.addUser({ userid, password: hash });

    const loginData = {
      userid,
      signInTime: Date.now(),
    };

    const token = jwt.sign(loginData, process.env.JWT_SECRET_KEY);
    console.log(`User created successfully: ${userid}, token: ${token}`);
    return token;
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

export default { auth, verify, register };
