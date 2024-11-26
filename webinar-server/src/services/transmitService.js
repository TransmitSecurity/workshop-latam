import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import {
  ERROR_CLIENT_ACCESS_TOKEN,
  ERROR_RISK_GET_RECOMMENDATION,
  ERROR_PASSKEY_AUTHENTICATION,
  ERROR_PASSKEY_REGISTRATION,
  ERROR_RISK_REPORT_ACTION,
  REPORT_CHALLENGE_TYPE,
  REPORT_RESULTS,
  IDO_TOKEN_ISSUER,
  ERROR_IDO_INVALID_TOKEN_ISSUER,
  ERROR_IDO_TOKEN_EXPIRED,
  ERROR_IDO_INVALID_TOKEN,
} from '../helpers/constants.js';

/**
 * Get ClientAccessToken using client credentials flow
 * @param {String} resource Target Resource for the ClientAccessToken (optional)
 * @returns client access_token
 */
export const getClientAccessToken = async (resource) => {
  const formData = {
    client_id: process.env.VITE_TS_CLIENT_ID,
    client_secret: process.env.TS_CLIENT_SECRET,
    grant_type: 'client_credentials',
  };
  if (resource) formData.resource = resource;

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

/** Target Resource for DRS Client Access Token */
const DRS_RESOURCE = 'https://risk.identity.security';

/**
 * Get DRS ClientAccessToken using client credentials flow
 * @returns client access_token
 */
export const getDRSClientAccessToken = async () => {
  return getClientAccessToken(DRS_RESOURCE);
};

/**
 * Register Passkey
 * @param {String} webauthnEncodedResult Returned by register() SDK call
 * @param {String} externalUserId Identifier of the user in your system
 * @param {String} clientAccessToken Transmit Platform Client Access Token
 */
export const registerPasskey = async (webauthnEncodedResult, externalUserId, clientAccessToken) => {
  try {
    const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/cis/v1/auth/webauthn/external/register`, {
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
    const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/cis/v1/auth/webauthn/authenticate`, {
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
  const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/cis/oidc/jwks`, {
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

/**
 * Fetch DRS recommendation
 * @param {String} actionToken Obtained from the SDK
 * @param {String} riskClientAccessToken  ClientAccessToken for the DRS API
 */
export const getDRSRecommendation = async (actionToken, riskClientAccessToken) => {
  try {
    const query = new URLSearchParams({ action_token: actionToken }).toString();

    const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/risk/v1/recommendation?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${riskClientAccessToken}`,
      },
    });

    const data = await resp.json();
    //console.log(`DRS Recommendation: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (error) {
    console.error(`${ERROR_RISK_GET_RECOMMENDATION}: ${error.message}`);
    throw new Error(ERROR_RISK_GET_RECOMMENDATION);
  }
};

/**
 * Report DRS Action Result
 * @param {String} actionToken DRS ActionToken
 * @param {String} result Result of the action
 * @param {String} riskClientAccessToken ClientAccessToken for the DRS API
 * @param {String} userId (Optional) User Identifier
 * @param {String} challengeType (Optional) Challenge Type
 * @returns action report JSON response
 */
export const reportDRSActionResult = async (
  actionToken,
  result,
  riskClientAccessToken,
  userId = null,
  challengeType = null,
) => {
  // Validate result and challengeType
  if (!Object.values(REPORT_RESULTS).includes(result)) {
    console.error(`${ERROR_RISK_REPORT_ACTION}: Invalid result`);
    throw new Error(ERROR_RISK_REPORT_ACTION);
  }
  if (challengeType && !Object.values(REPORT_CHALLENGE_TYPE).includes(challengeType)) {
    console.error(`${ERROR_RISK_REPORT_ACTION}: Invalid challenge type`);
    throw new Error(ERROR_RISK_REPORT_ACTION);
  }

  // Report action result
  try {
    const body = {
      action_token: actionToken,
      result: result,
    };
    if (userId) body.user_id = userId;
    if (challengeType) body.challenge_type = challengeType;

    const resp = await fetch(`${process.env.VITE_TS_BASE_URL}/risk/v1/action/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riskClientAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (resp.status === 201) {
      console.log(
        `Action result reported: ${result} for ${actionToken} [user: ${userId}, challenge: ${challengeType}]`,
      );
      const data = await resp.json();
      console.log(`Action reported: ${JSON.stringify(data)}`); // for visibility only
      return data;
    } else {
      console.error(`Error reporting action result: ${resp.status}`);
      throw new Error(ERROR_RISK_REPORT_ACTION);
    }
  } catch (error) {
    console.error(`${ERROR_RISK_REPORT_ACTION}: ${error.message}`);
    throw new Error(ERROR_RISK_REPORT_ACTION);
  }
};

/**
 * Validate IDO token
 * @param {Object} token IDO journey output token
 * @param {String} idoClientAccessToken Bearer token for Mosaic APIs
 * @returns decoded token if valid
 * @throws {Error} if token is invalid
 */
export const validateIDOToken = async (token, idoClientAccessToken) => {
  // Token decoded and not verified. Verification below through IDO introspection
  const decoded = jwt.decode(token);

  if (!idoClientAccessToken) {
    idoClientAccessToken = await getClientAccessToken();
  }

  // Verify the token signature, return token or error
  const resp = await fetch(
    `${process.env.VITE_TS_BASE_URL}/ido/api/v2/token/introspect?clientId=${process.env.VITE_TS_CLIENT_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idoClientAccessToken}`,
      },
      body: JSON.stringify({
        token: token,
      }),
    },
  );
  // Introspection response -> (error_code == 0) means valid token
  const data = await resp.json();
  if (!resp.ok || data.error_code !== 0) {
    console.error(ERROR_IDO_INVALID_TOKEN);
    throw new Error(ERROR_IDO_INVALID_TOKEN);
  }

  // Verify token issuer
  if (decoded.iss !== IDO_TOKEN_ISSUER) {
    console.error(ERROR_IDO_INVALID_TOKEN_ISSUER);
    throw new Error(ERROR_IDO_INVALID_TOKEN_ISSUER);
  }

  // Verify token expiration
  const d_now = new Date();
  const now = Math.floor(d_now / 1000);
  const exp = decoded.exp;
  const iat = decoded.iat;
  console.log(
    `iat<---${now - iat}--->now (${new Date(d_now - d_now.getTimezoneOffset() * 60 * 1000).toISOString()})<---${exp - now}--->exp`,
  ); // TODO: for visibility only
  if (exp < now) {
    console.error(ERROR_IDO_TOKEN_EXPIRED);
    throw new Error(ERROR_IDO_TOKEN_EXPIRED);
  }

  return decoded;
};
