/* Key to store user information in local storage */
export const STORE_KEY = 'ianftart_user';

/**
 * Store user data in local storage
 * @param {String} userid User identifier
 * @param {String} token JWT access token
 * @param {Object} cart Shopping cart
 */
export const storeSaveUser = (userid, token, cart = {}) => {
  localStorage.setItem(STORE_KEY, JSON.stringify({ userid, token, cart }));
};

/**
 * Get user data from local storage
 * @returns User data from local storage
 */
export const storeGetUser = () => {
  return localStorage.getItem(STORE_KEY) ? JSON.parse(localStorage.getItem(STORE_KEY)) : null;
};

/**
 * Update cart UI
 */
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

/**
 * Add product to cart
 * @param {Object} product Product to add to cart
 */
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

/**
 * Update quantity of product in cart
 * @param {Number} productId Product identifier
 * @param {Number} quantity Quantity to update
 */
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

/**
 * Remove product from cart
 * @param {Number} productId Product identifier
 */
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

/**
 * Remove one quantity of product from cart
 * @param {Number} productId Product identifier
 */
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

/**
 * Clear cart
 */
export const storeClearCart = () => {
  const user = storeGetUser();
  if (user) {
    storeSaveUser(user.userid, user.token, {});
    cartUpdateDisplay();
  }
};

/**
 * Calculates the subtotal of the cart
 * @returns Subtotal of cart
 */
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
