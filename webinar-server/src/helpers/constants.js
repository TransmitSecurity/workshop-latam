export const ERROR_AUTHENTICATION = 'Invalid authentication';
export const ERROR_REGISTRATION = 'Error registering user';
export const ERROR_JWT_AUTHN = 'Invalid JWT token';
export const ERROR_USER_EXISTS = 'User already exists';

export const ERROR_CLIENT_ACCESS_TOKEN = 'Error getting client access token';
export const ERROR_PASSKEY_REGISTRATION = 'Error registering passkey';
export const ERROR_PASSKEY_AUTHENTICATION = 'Error authenticating passkey';

export const ERROR_RISK_GET_RECOMMENDATION = 'Error getting risk recommendation';
export const ERROR_RISK_INVALID_ACTION_TOKEN = `${ERROR_RISK_GET_RECOMMENDATION}: Invalid action token`;
export const ERROR_RISK_REPORT_ACTION = 'Error reporting action';
export const ERROR_RISK_DENY = 'Risk recommendation is to deny';

export const ERROR_IDO_INVALID_TOKEN_ISSUER = 'Invalid IDO token issuer';
export const ERROR_IDO_TOKEN_EXPIRED = 'IDO token expired';

export const RECOMMENDATIONS = {
  DENY: 'DENY',
  CHALLENGE: 'CHALLENGE',
  ALLOW: 'ALLOW',
  TRUST: 'TRUST',
};

export const REPORT_RESULTS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  INCOMPLETE: 'incomplete',
};

export const REPORT_CHALLENGE_TYPE = {
  SMS_OTP: 'sms_otp',
  EMAIL_OTP: 'email_otp',
  TOTP: 'totp',
  PUSH_OTP: 'push_otp',
  VOICE_OTP: 'voice_otp',
  IDV: 'idv',
  CAPTCHA: 'captcha',
  PASSWORD: 'password',
  PASSKEY: 'passkey',
};

export const IDO_TOKEN_ISSUER = 'TS';
