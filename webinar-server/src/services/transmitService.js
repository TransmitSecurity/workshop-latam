import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import {
  ERROR_CLIENT_ACCESS_TOKEN,
  ERROR_PASSKEY_AUTHENTICATION,
  ERROR_PASSKEY_REGISTRATION,
} from '../helpers/constants.js';

/**
 * Get ClientAccessToken using client credentials flow
 * @returns client access_token
 */
export const getClientAccessToken = async () => {
  const formData = {
    client_id: process.env.VITE_TS_CLIENT_ID,
    client_secret: process.env.TS_CLIENT_SECRET,
    grant_type: 'client_credentials',
  };

  try {
    const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/oidc/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(formData).toString(),
    });

    const data = await resp.json();
    return data.access_token;
  } catch (error) {
    console.error(`${ERROR_CLIENT_ACCESS_TOKEN}: ${error.message}`);
    throw new Error(ERROR_CLIENT_ACCESS_TOKEN);
  }
};

/**
 * Register Passkey
 * @param {String} webauthnEncodedResult Returned by register() SDK call
 * @param {String} externalUserId Identifier of the user in your system
 * @param {String} clientAccessToken Transmit Platform Client Access Token
 */
export const registerPasskey = async (webauthnEncodedResult, externalUserId, clientAccessToken) => {
  try {
    const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/v1/auth/webauthn/external/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientAccessToken}`, // Client access token
      },
      body: JSON.stringify({
        webauthn_encoded_result: webauthnEncodedResult, // Returned by register() SDK call
        external_user_id: externalUserId, // Identifier of the user in your system
      }),
    });

    const data = await resp.json();
    //console.log(`User registered: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (error) {
    console.error(`${ERROR_PASSKEY_REGISTRATION}: ${error.message}`);
    throw new Error(ERROR_PASSKEY_REGISTRATION);
  }
};

/**
 * Authenticate Passkey
 * @param {String} webauthnEncodedResult Returned by authenticate() SDK call
 * @param {String} clientAccessToken Transmit Platform Client Access Token
 */
export const authPasskey = async (webauthnEncodedResult, clientAccessToken) => {
  try {
    const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/v1/auth/webauthn/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientAccessToken}`, // Client access token
      },
      body: JSON.stringify({
        webauthn_encoded_result: webauthnEncodedResult, // Returned by authenticate() SDK call
      }),
    });

    const data = await resp.json();
    //console.log(`User authenticated: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (error) {
    console.error(`${ERROR_PASSKEY_AUTHENTICATION}: ${error.message}`);
    throw new Error(ERROR_PASSKEY_AUTHENTICATION);
  }
};

/**
 * Get Transmit Platform JWKS
 * @returns JKWS
 */
const getJwks = async () => {
  // No error handling for the sake of simplicity
  const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/oidc/jwks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await resp.json();
  return data;
};

/**
 * Validates a JWT token
 * @param {String} token token to validate
 * @returns decoded validated token
 */
export const validateToken = async (token) => {
  const jwks = await getJwks();
  const { header } = jwt.decode(token, { complete: true });
  const kid = header.kid;
  const key = jwks.keys.find((key) => key.kid === kid);
  const publicKey = jwkToPem(key);

  return jwt.verify(token, publicKey);
};
