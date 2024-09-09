export const ERROR_AUTHENTICATION = 'Invalid authentication';
export const ERROR_REGISTRATION = 'Error registering user';
export const ERROR_JWT_AUTHN = 'Invalid JWT token';
export const ERROR_USER_EXISTS = 'User already exists';

export const ERROR_CLIENT_ACCESS_TOKEN = 'Error getting client access token';
export const ERROR_PASSKEY_REGISTRATION = 'Error registering passkey';
export const ERROR_PASSKEY_AUTHENTICATION = 'Error authenticating passkey';

export const ERROR_RISK_GET_RECOMMENDATION = 'Error getting risk recommendation';
export const ERROR_RISK_INVALID_ACTION_TOKEN = `${ERROR_RISK_GET_RECOMMENDATION}: Invalid action token`;
export const ERROR_RISK_DENY = 'Risk recommendation is to deny';

export const RECOMMENDATIONS = {
  DENY: 'DENY',
  CHALLENGE: 'CHALLENGE',
  ALLOW: 'ALLOW',
  TRUST: 'TRUST',
};
