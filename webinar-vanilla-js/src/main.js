import './style.css';

// UI Tools
import * as uiTools from './js/ui-tools.js';
export const { showModal, addModal, showToastSync, animateOtpInputs, getOtpFromInputs } = uiTools;

// Flags Helper
import * as flags from './js/flags-helper.js';
export const { checkFlag } = flags;

// Transmit Helper
import * as transmit from './js/transmit-helper.js';
export const { loadAndInitTsSdk, drsClearUser, RISK_ACTIONS } = transmit;

import * as transmitOrchestration from './js/transmit-ido-helper.js';
export const { newOrchestrationController } = transmitOrchestration;

// Local Storage & Cart
import * as storage from './js/local-storage.js';
export const {
  STORE_KEY,
  storeGetUser,
  storeSaveUser,
  storeAddToCart,
  storeUpdateQuantity,
  cartUpdateDisplay,
  storeRemoveFromCart,
  storeRemoveOneFromCart,
  storeClearCart,
  storeCalculateSubtotal,
} = storage;

/**
 * Clean logout
 * Deletes local user data and redirects to home
 */
const cleanLogout = () => {
  // Clear local user data
  localStorage.removeItem(STORE_KEY);
  window.location.href = '/';
};

/**
 * Logout
 * Clears DRS user and calls cleanLogout
 */
export const logout = async () => {
  // Clear DRS user
  if (window.tsPlatform?.drs) {
    await drsClearUser();
    cleanLogout();
  } else {
    loadAndInitTsSdk(async () => {
      try {
        await drsClearUser();
      } catch (ignored) {} // eslint-disable-line no-unused-vars, no-empty
      cleanLogout();
    });
  }
};

/***** ROUTER *****/

/* Application Routes */
const ROUTES = [
  { path: '/', auth: false, loadTsSDK: false },
  { path: '/index.html', auth: false, loadTsSDK: false },
  { path: '/sign-up.html', auth: false, loadTsSDK: false },
  { path: '/home.html', auth: true, loadTsSDK: true },
  { path: '/product.html', auth: true, loadTsSDK: true },
  { path: '/cart.html', auth: true, loadTsSDK: true },
  { path: '/checkout.html', auth: true, loadTsSDK: true },
  { path: '/checkout-done.html', auth: true, loadTsSDK: true },
  { path: '/not-found.html', auth: true, loadTsSDK: true },
  { path: '/error.html', auth: true, loadTsSDK: true },
];

/**
 * Main function
 * Router and initial setup
 */
(() => {
  // Router
  const currentRoute = window.location.pathname;
  const route = ROUTES.find((route) => route.path === currentRoute);
  if (!route) {
    window.location.href = '/not-found.html';
    return;
  } else if (route.auth && !storeGetUser()) {
    window.location.href = '/';
    return;
  } else if (route && !route.auth && storeGetUser()) {
    window.location.href = '/home.html';
    return;
  }

  // Load Transmit SDK
  if (route.loadTsSDK) {
    loadAndInitTsSdk();
  }

  // Update Cart
  if (route && route.auth) {
    cartUpdateDisplay();
  }

  // Add Profile Dropdown
  if (route && route.auth) {
    let username = storeGetUser().userid;
    if (username?.indexOf('@') > 0) {
      username = username.split('@')[0];
    }
    uiTools.addProfileDropdown(username, logout);
  }
})();
