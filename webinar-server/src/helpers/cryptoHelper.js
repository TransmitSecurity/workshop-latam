import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Compares a password with a hash
 * @param {String} password
 * @param {String} hash
 * @returns true if the password matches the hash
 */
export const bcryptCompareSync = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (_err, result) => {
      if (!result) {
        reject(new Error('Invalid password'));
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Hashes a password
 * @param {String} password
 * @returns hashed password
 */
export const bcryptHashSync = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (_err, hash) => {
      if (hash) {
        resolve(hash);
      } else {
        reject(new Error('Invalid password'));
      }
    });
  });
};

/**
 * Sign session token for the user passed as parameter
 * @param {JSON} userId userId/externalUserId
 * @returns signed token
 */
export const signSessionJWT = (userId) => {
  let loginData = {
    userid: userId,
    signInTime: Date.now(),
  };
  return jwt.sign(loginData, process.env.JWT_SECRET_KEY);
};
