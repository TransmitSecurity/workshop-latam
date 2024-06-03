import jwt from 'jsonwebtoken';
import { ERROR_JWT_AUTHN } from './constants.js';

/**
 * Authentication middleware.
 * This middleware will be used to authenticate the user based on the token provided in the request header.
 */
export const authMiddleware = (req, res, next) => {
  const tokenHeaderKey = process.env.JWT_HEADER.toLowerCase();
  const authHeader = req.headers[tokenHeaderKey];
  const authToken = authHeader.split(' ')[1];
  if (!authHeader || !authHeader.startsWith(`${process.env.JWT_TYPE} `)) {
    console.log(`Invalid JWT token: ${authHeader}`);
    return res.status(401).json({ message: ERROR_JWT_AUTHN });
  }

  try {
    const verified = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    if (verified) {
      req.locals = { userid: verified.userid };
      console.log(`JWT token verified: ${JSON.stringify(verified)}`);
      console.log(`JWT token issued: ${(Date.now() - verified.signInTime) / 1000} seconds ago`);
      return next();
    } else {
      console.log(`JWT token verification failed: ${authToken}`);
      return res.status(401).json({ message: ERROR_JWT_AUTHN });
    }
  } catch (error) {
    console.log(`JWT token verification error: ${error.message}`);
    return res.status(401).json({ message: ERROR_JWT_AUTHN });
  }
};
