import bcrypt from 'bcrypt';

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
