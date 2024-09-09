/**
 * Check if a flag is enabled in .env
 * @param {String} flagName Name of the flag feature in .env
 * @returns boolean
 */
export const checkFlag = (flagName) => {
  const flag = import.meta.env[flagName];
  return flag && flag === 'true';
};
