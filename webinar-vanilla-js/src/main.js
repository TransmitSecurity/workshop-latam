import './style.css';

/***** AUTH MGMT *****/
const STORE_KEY = 'ianftart_user';
export const storeSaveUser = (userid, token, cart = {}) => {
  localStorage.setItem(STORE_KEY, JSON.stringify({ userid, token, cart }));
};
export const storeGetUser = () => {
  return localStorage.getItem(STORE_KEY) ? JSON.parse(localStorage.getItem(STORE_KEY)) : null;
};

/***** Shopping Cart UI *****/
export const cartUpdateDisplay = () => {
  const cartItems = document.getElementById('cart-items');
  const user = storeGetUser();
  if (user && cartItems) {
    const { cart } = user;
    if (cart && Object.keys(cart).length > 0) {
      cartItems.innerHTML = Object.keys(cart).length;
      cartItems.classList.remove('hidden');
    } else {
      cartItems.classList.add('hidden');
    }
  }
};

/***** Shopping cart */
export const storeAddToCart = (product) => {
  const user = storeGetUser();
  if (user) {
    let { cart } = user;
    if (cart && product.id in cart) {
      const productInCart = cart[product.id];
      productInCart.quantity += product.quantity;
    } else {
      if (!cart) cart = {};
      cart[product.id] = product;
    }
    storeSaveUser(user.userid, user.token, cart);
    cartUpdateDisplay();
  }
};
export const storeUpdateQuantity = (productId, quantity) => {
  const user = storeGetUser();
  if (user) {
    let { cart } = user;
    if (cart && productId in cart) {
      cart[productId].quantity = quantity;
      storeSaveUser(user.userid, user.token, cart);
    }
  }
};
export const storeRemoveFromCart = (productId) => {
  const user = storeGetUser();
  if (user) {
    let { cart } = user;
    if (cart && productId in cart) {
      delete cart[productId];
      storeSaveUser(user.userid, user.token, cart);
      cartUpdateDisplay();
    }
  }
};
export const storeRemoveOneFromCart = (productId) => {
  const user = storeGetUser();
  if (user) {
    let { cart } = user;
    if (cart && productId in cart) {
      const productInCart = cart[productId];
      if (productInCart.quantity > 1) {
        productInCart.quantity -= 1;
      } else {
        delete cart[productId];
      }
      storeSaveUser(user.userid, user.token, cart);
      cartUpdateDisplay();
    }
  }
};
export const storeClearCart = () => {
  const user = storeGetUser();
  if (user) {
    storeSaveUser(user.userid, user.token, {});
    cartUpdateDisplay();
  }
};
export const storeCalculateSubtotal = () => {
  const user = storeGetUser();
  if (user) {
    const { cart } = user;
    if (cart) {
      return Object.values(cart).reduce((acc, product) => acc + product.price * product.quantity, 0);
    }
  }
  return 0;
};
export const logout = () => {
  localStorage.removeItem(STORE_KEY);
  window.location.href = '/';
};

/***** ROUTER *****/
const ROUTES = [
  { path: '/', auth: false },
  { path: '/index.html', auth: false },
  { path: '/sign-up.html', auth: false },
  { path: '/home.html', auth: true },
  { path: '/product.html', auth: true },
  { path: '/cart.html', auth: true },
  { path: '/checkout.html', auth: true },
  { path: '/checkout-done.html', auth: true },
  { path: '/not-found.html', auth: true },
  { path: '/error.html', auth: true },
];

(() => {
  // Router
  const currentRoute = window.location.pathname;
  const route = ROUTES.find((route) => route.path === currentRoute);
  if (!route) {
    window.location.href = '/not-found.html';
  } else if (route.auth && !storeGetUser()) {
    window.location.href = '/';
  } else if (route && !route.auth && storeGetUser()) {
    window.location.href = '/home.html';
  }

  // Update Cart
  if (route && route.auth) {
    cartUpdateDisplay();
  }

  // Add profile dropdown
  const profileIcon = document.getElementById('profile-icon');
  if (profileIcon) {
    const menuDiv = document.createElement('div');
    menuDiv.className =
      'hidden origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-fadeIn';
    let username = storeGetUser().userid;
    if (username.indexOf('@') > 0) {
      username = username.split('@')[0];
    }
    const menu = `
    <p class="gap-2 px-6 pt-[9px] pb-1 text-start block font-sans text-sm antialiased font-semibold leading-normal text-inherit">Hi, ${username}</p>
    <hr class="my-1 border-blue-gray-50" />
    <button
      role="menuitem"
      class="disabled-item flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8ZM10 5C10 5.53043 9.78929 6.03914 9.41421 6.41421C9.03914 6.78929 8.53043 7 8 7C7.46957 7 6.96086 6.78929 6.58579 6.41421C6.21071 6.03914 6 5.53043 6 5C6 4.46957 6.21071 3.96086 6.58579 3.58579C6.96086 3.21071 7.46957 3 8 3C8.53043 3 9.03914 3.21071 9.41421 3.58579C9.78929 3.96086 10 4.46957 10 5ZM8 9C7.0426 8.99981 6.10528 9.27449 5.29942 9.7914C4.49356 10.3083 3.85304 11.0457 3.454 11.916C4.01668 12.5706 4.71427 13.0958 5.49894 13.4555C6.28362 13.8152 7.13681 14.0009 8 14C8.86319 14.0009 9.71638 13.8152 10.5011 13.4555C11.2857 13.0958 11.9833 12.5706 12.546 11.916C12.147 11.0457 11.5064 10.3083 10.7006 9.7914C9.89472 9.27449 8.9574 8.99981 8 9Z"
          fill="currentColor"></path>
      </svg>
      <p class="block font-sans text-sm antialiased font-medium leading-normal text-inherit">My Profile</p>
    </button>
    <button
      role="menuitem"
      class="disabled-item flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9.48999 1.17C9.10999 -0.39 6.88999 -0.39 6.50999 1.17C6.45326 1.40442 6.34198 1.62213 6.18522 1.80541C6.02845 1.9887 5.83063 2.13238 5.60784 2.22477C5.38505 2.31716 5.1436 2.35564 4.90313 2.33709C4.66266 2.31854 4.42997 2.24347 4.22399 2.118C2.85199 1.282 1.28199 2.852 2.11799 4.224C2.65799 5.11 2.17899 6.266 1.17099 6.511C-0.390006 6.89 -0.390006 9.111 1.17099 9.489C1.40547 9.54581 1.62322 9.65719 1.80651 9.81407C1.98979 9.97096 2.13343 10.1689 2.22573 10.3918C2.31803 10.6147 2.35639 10.8563 2.33766 11.0968C2.31894 11.3373 2.24367 11.5701 2.11799 11.776C1.28199 13.148 2.85199 14.718 4.22399 13.882C4.42993 13.7563 4.66265 13.6811 4.90318 13.6623C5.14371 13.6436 5.38527 13.682 5.60817 13.7743C5.83108 13.8666 6.02904 14.0102 6.18592 14.1935C6.34281 14.3768 6.45419 14.5945 6.51099 14.829C6.88999 16.39 9.11099 16.39 9.48899 14.829C9.54599 14.5946 9.65748 14.377 9.8144 14.1939C9.97132 14.0107 10.1692 13.8672 10.3921 13.7749C10.6149 13.6826 10.8564 13.6442 11.0969 13.6628C11.3373 13.6815 11.57 13.7565 11.776 13.882C13.148 14.718 14.718 13.148 13.882 11.776C13.7565 11.57 13.6815 11.3373 13.6628 11.0969C13.6442 10.8564 13.6826 10.6149 13.7749 10.3921C13.8672 10.1692 14.0107 9.97133 14.1939 9.81441C14.377 9.65749 14.5946 9.546 14.829 9.489C16.39 9.11 16.39 6.889 14.829 6.511C14.5945 6.45419 14.3768 6.34281 14.1935 6.18593C14.0102 6.02904 13.8666 5.83109 13.7743 5.60818C13.682 5.38527 13.6436 5.14372 13.6623 4.90318C13.681 4.66265 13.7563 4.42994 13.882 4.224C14.718 2.852 13.148 1.282 11.776 2.118C11.5701 2.24368 11.3373 2.31895 11.0968 2.33767C10.8563 2.35639 10.6147 2.31804 10.3918 2.22574C10.1689 2.13344 9.97095 1.9898 9.81407 1.80651C9.65718 1.62323 9.5458 1.40548 9.48899 1.171L9.48999 1.17ZM7.99999 11C8.79564 11 9.55871 10.6839 10.1213 10.1213C10.6839 9.55871 11 8.79565 11 8C11 7.20435 10.6839 6.44129 10.1213 5.87868C9.55871 5.31607 8.79564 5 7.99999 5C7.20434 5 6.44128 5.31607 5.87867 5.87868C5.31606 6.44129 4.99999 7.20435 4.99999 8C4.99999 8.79565 5.31606 9.55871 5.87867 10.1213C6.44128 10.6839 7.20434 11 7.99999 11Z"
          fill="currentColor"></path>
      </svg>
      <p class="block font-sans text-sm antialiased font-medium leading-normal text-inherit">
        Edit Profile
      </p>
    </button>
    <button
      role="menuitem"
      class="disabled-item flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2z"></path>
        <path fill-rule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 01-1.99 1.79H4.802a2 2 0 01-1.99-1.79L2 7.5zM7 11a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"></path>
      </svg>
      <p class="block font-sans text-sm antialiased font-medium leading-normal text-inherit">
        My Purchases
      </p>
    </button>
    <button
      role="menuitem"
      class="disabled-item flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"></path>
      </svg>    
      <p class="block font-sans text-sm antialiased font-medium leading-normal text-inherit">
        My List
      </p>
    </button>
    <hr class="my-2 border-blue-gray-50" />
    <button id="btn-sign-out"
      role="menuitem"
      class="flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
      <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M1 0C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1V13C0 13.2652 0.105357 13.5196 0.292893 13.7071C0.48043 13.8946 0.734784 14 1 14C1.26522 14 1.51957 13.8946 1.70711 13.7071C1.89464 13.5196 2 13.2652 2 13V1C2 0.734784 1.89464 0.48043 1.70711 0.292893C1.51957 0.105357 1.26522 0 1 0ZM11.293 9.293C11.1108 9.4816 11.01 9.7342 11.0123 9.9964C11.0146 10.2586 11.1198 10.5094 11.3052 10.6948C11.4906 10.8802 11.7414 10.9854 12.0036 10.9877C12.2658 10.99 12.5184 10.8892 12.707 10.707L15.707 7.707C15.8945 7.51947 15.9998 7.26516 15.9998 7C15.9998 6.73484 15.8945 6.48053 15.707 6.293L12.707 3.293C12.6148 3.19749 12.5044 3.12131 12.3824 3.0689C12.2604 3.01649 12.1292 2.9889 11.9964 2.98775C11.8636 2.9866 11.7319 3.0119 11.609 3.06218C11.4861 3.11246 11.3745 3.18671 11.2806 3.2806C11.1867 3.3745 11.1125 3.48615 11.0622 3.60905C11.0119 3.73194 10.9866 3.86362 10.9877 3.9964C10.9889 4.12918 11.0165 4.2604 11.0689 4.3824C11.1213 4.50441 11.1975 4.61475 11.293 4.707L12.586 6H5C4.73478 6 4.48043 6.10536 4.29289 6.29289C4.10536 6.48043 4 6.73478 4 7C4 7.26522 4.10536 7.51957 4.29289 7.70711C4.48043 7.89464 4.73478 8 5 8H12.586L11.293 9.293Z"
          fill="black"></path>
      </svg>
      <p class="block font-sans text-sm antialiased font-medium leading-normal text-inherit">Sign Out</p>
    </button>
    `;
    menuDiv.innerHTML = menu;
    profileIcon.parentNode.appendChild(menuDiv);
    profileIcon.addEventListener('click', () => {
      menuDiv.classList.toggle('hidden');
    });
    document.getElementById('btn-sign-out').addEventListener('click', logout);
  }
})();

/***** Toast *****/
const ICONS = {
  success: '<span class="material-symbols-outlined">task_alt</span>',
  danger: '<span class="material-symbols-outlined">error</span>',
  warning: '<span class="material-symbols-outlined">warning</span>',
  info: '<span class="material-symbols-outlined">info</span>',
};
const TOAST_DEF_DURATION = 5000;
const TOAST_DEF_TYPE = 'info';

const showToast = (message = '', toastType = TOAST_DEF_TYPE, duration = TOAST_DEF_DURATION) => {
  let icon = '(i)';
  if (Object.keys(ICONS).includes(toastType)) {
    icon = ICONS[toastType];
  }

  let box = document.createElement('div');
  box.classList.add('toast', `toast-${toastType}`);
  box.innerHTML = ` <div class="toast-content-wrapper"> 
                    <div class="toast-icon"> 
                    ${icon} 
                    </div> 
                    <div class="toast-message">${message}</div> 
                    <div class="toast-progress"></div> 
                    </div>`;
  duration = duration || TOAST_DEF_DURATION;
  box.querySelector('.toast-progress').style.animationDuration = `${duration / 1000}s`;

  let toastAlready = document.body.querySelector('.toast');
  if (toastAlready) {
    toastAlready.remove();
  }

  document.body.appendChild(box);
  return box;
};
export const showToastSync = async (message = '', toastType = TOAST_DEF_TYPE, duration = TOAST_DEF_DURATION) => {
  const toastDiv = showToast(message, toastType, duration);
  await new Promise((resolve) => setTimeout(resolve, duration));
  toastDiv.remove();
};

/***** MODAL DIALOG *****/
export const addModal = (title, message, closeButton = false) => {
  let overlay = document.createElement('div');
  overlay.setAttribute('id', 'overlay');
  overlay.className = 'fixed hidden z-40 w-screen h-screen inset-0 bg-gray-900 bg-opacity-60';
  let modal = document.createElement('div');
  modal.setAttribute('id', 'dialog');
  modal.className =
    'hidden fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-md px-8 py-6 space-y-5 drop-shadow-lg';
  modal.innerHTML = `
        <h1 class="text-2xl font-semibold">
          <span class="bg-indigo-900 text-white font-semibold rounded-full py-1 px-2">AI</span>
          <span class="text-slate-900">N</span><span class="text-slate-700">F</span
          ><span class="text-slate-500">T</span>
          <span class="text-3xl ina-logo text-indigo-600">Art</span>
        </h1>
        <div class="py-5 border-b border-gray-300 text-2xl font-semibold">
          ${title}
        </div>
        <div class="py-5 border-b border-gray-300">
            <p>${message}</p>
        </div>
        <img src="/img/loading.gif" alt="Loading" />
  `;
  if (closeButton) {
    modal.innerHTML += `
        <div class="flex justify-end">
            <!-- This button is used to close the dialog -->
            <button id="btn-close-dialog" class="px-5 py-2 bg-indigo-500 hover:bg-indigo-700 text-white cursor-pointer rounded-md">
                Close</button>
        </div>
    `;
  }
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Close button
  if (closeButton) {
    modal.querySelector('#btn-close-dialog').addEventListener('click', () => {
      modal.classList.add('hidden');
      overlay.classList.add('hidden');
    });
  }

  return modal;
};
export const showModal = async (seconds) => {
  const dialog = document.getElementById('dialog');
  const overlay = document.getElementById('overlay');
  dialog.classList.remove('hidden');
  overlay.classList.remove('hidden');
  return new Promise((resolve) => {
    setTimeout(() => {
      dialog.classList.add('hidden');
      overlay.classList.add('hidden');
      resolve();
    }, seconds * 1000);
  });
};
