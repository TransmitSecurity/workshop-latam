/***** TRANSMIT SDK *****/
// Script ID
const TS_SDK_SCRIPT_ID = 'ts-platform-script';

/**
 * Dynamically load SDK
 *  <script
 *    src="https://platform-websdk.transmitsecurity.io/platform-websdk/1.x/ts-platform-websdk.js"
 *    defer="true"
 *    id="ts-platform-script"></script>
 */
const loadTsSdk = (onload) => {
  if (document.getElementById(TS_SDK_SCRIPT_ID)) {
    console.warn('TS SDK already loaded');
    return;
  }
  const tsScript = document.createElement('script');
  tsScript.src = import.meta.env.VITE_TS_SDK_URL;
  tsScript.defer = true;
  tsScript.id = TS_SDK_SCRIPT_ID;
  if (onload) tsScript.addEventListener('load', onload);
  document.body.appendChild(tsScript);
};

/**
 * Initialize Transmit SDK
 */
const initTsSdk = async () => {
  try {
    await window.tsPlatform.initialize({
      clientId: import.meta.env.VITE_TS_CLIENT_ID,
      webauthn: { serverPath: import.meta.env.VITE_TS_BASE_URL },
    });
    console.log('TS Platform SDK initialized');
  } catch (error) {
    console.error('TS Platform SDK initialization failed:', error);
    throw error;
  }
};

/**
 * Load and initialize Transmit SDK
 * @param {function} callback
 */
export const loadAndInitTsSdk = async (callback) => {
  loadTsSdk(async () => {
    try {
      await initTsSdk();
      callback && callback();
    } catch (error) {
      console.error('TS SDK initialization failed:', error);
    }
  });
};

/**
 * Clear DRS user
 */
export const drsClearUser = async () => {
  // DRS Clear User
  try {
    const clearUserOk = await window.tsPlatform.drs.clearUser();
    console.log('User cleared:', clearUserOk ? 'OK' : 'Failed');
  } catch (error) {
    console.error('DRS clearUser failed:', error);
  }
};

/***** RISK ACTIONS *****/
export const RISK_ACTIONS = {
  REGISTER: 'register',
  LOGIN: 'login',
  CHECKOUT: 'checkout',
};
