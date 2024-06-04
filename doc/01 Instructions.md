# Webinar Series - Customer Identity (by Transmit Security)

## SESSION 1: WebAuthn/Passkeys

### S1 - 0. Set up your environment
1. You are going to need [nodejs](https://nodejs.org). Install it following the instructions [here](https://nodejs.org/en/download/package-manager).
2. Get the starter code for the demo application we are going to use:
  ```Bash
  git clone -b step1-starter https://github.com/transmitsecurity/workshop-latam
  ```
3. Install dependencies
  ```Bash
  cd workshop-latam 
  npm install
  ```
4. Create configuration file
  ```Bash
  cp dotenv.example .env
  ```
5. Start the server
  ```Bash
  npm start
  ```
1. Browse to `http://localhost:3001`, you should see the login page for our brand new (and fake) **<span style="color:purple">"Artificial Intelligence-created NFT Art Site"</span>** (aka **AI NFT Art**)


### S1 - 1. Get your credentials
Your hosts in the session will provide the instructions for this step.

### S1 - 2. Include and Initialize Transmit SDK
First, edit `.env` file at the root folder and modify the following lines with the right values provided for you in step 1:
```txt
### Transmit configuration ###
VITE_TS_CLIENT_ID=<your_transmit_app_client_id>
TS_CLIENT_SECRET=<your_transmit_app_client_secret>
VITE_TS_BASE_URL=https://api.transmitsecurity.io/cis
```

Restart the application so that it gets the new values in `.env`
```Bash
<Ctrl>+C
npm start
```

Include Transmit SDK and initialize it in login and sign-up pages (`index.html` and `sign-up.html` respectively), located in `webinar-vanilla-js/src` folder.

Edit `index.html` and `sign-up.html` and include the sdk script at the bottom of the page, just before `</body>`.

```HTML
<!-- This loads the latest SDK within the major version 1. -->
<script
  src="https://platform-websdk.transmitsecurity.io/platform-websdk/latest/ts-platform-websdk.js"
  defer="true"
  id="ts-platform-script"></script>
```

### S1 - 3. Let's start with the Passkey Registration
#### S1 - 3.1 Server-Side
Move to `webinar-server`.
Let's start creating the file `src/services/transmitService.js` with the calls to the Transmit APIs we will need for passkeys registration.

```Javascript
import { ERROR_CLIENT_ACCESS_TOKEN, ERROR_PASSKEY_REGISTRATION } from '../helpers/constants.js';

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
    console.log(`User registered: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (error) {
    console.error(`${ERROR_PASSKEY_REGISTRATION}: ${error.message}`);
    throw new Error(ERROR_PASSKEY_REGISTRATION);
  }
};
```

Now we need to add an endpoint on our server to allow user registration with Passkeys. We will create a controller to take care of the flow and update the router with a new endpoint for this.
First, let's create a new controller for this: 
Create the file `src/controllers/passkeysController.js` and add the following code:

```Javascript
import jwt from 'jsonwebtoken';
import dbService from '../services/dbService.js';
import { ERROR_PASSKEY_REGISTRATION, ERROR_USER_EXISTS } from '../helpers/constants.js';
import { getClientAccessToken, registerPasskey } from '../services/transmitService.js';

const registerUserPasskey = async (webauthnEncodedResult, userid) => {
  try {
    // Check if user already exists
    if (dbService.getUserByUserId(userid)) {
      console.log(`User ${userid} already exists`);
      throw new Error(ERROR_USER_EXISTS);
    }

    // Register Passkey
    const clientAccessToken = await getClientAccessToken();
    const passkeyInfo = await registerPasskey(webauthnEncodedResult, userid, clientAccessToken);
    // Save user in database
    console.log({ userid, passkeyInfo });
    await dbService.addUser({ userid, passkeyInfo });

    const loginData = {
      userid,
      signInTime: Date.now(),
    };

    const token = jwt.sign(loginData, process.env.JWT_SECRET_KEY);
    console.log(`User created successfully: ${userid}, token: ${token}`);
    return token;
  } catch (error) {
    console.error(`${ERROR_PASSKEY_REGISTRATION}: ${error.message}`);
    throw new Error(`${ERROR_PASSKEY_REGISTRATION}: ${error.message}`);
  }
};

export default { registerUserPasskey };
```
This method takes care of checking if the user already exists, register the passkey and save the user in the database. Finally, in the same way as the password based registration, it creates a JWT for the user to login and keep browsing the site.

The server side is almost done, we only need to "publish" the new endpoint so that the client can register a user with Passkeys. To do that, open `src/routes/defaultRouter.js`, add the following import at the beginning of the file:
```Javascript
import passkeysController from '../controllers/passkeysController.js';
```

to import the recently created "passkeysController", and add a POST endpoint for ```/webauthn/register```:

```Javascript
// The register-passkeys endpoint that registers a new passkey
defaultRouter.post('/webauthn/register', async (req, res) => {
  const { webauthnEncodedResult, userId } = req.body;
  if (!webauthnEncodedResult || !userId) return res.status(400).json({ message: 'Invalid request' });
  try {
    const token = await passkeysController.registerUserPasskey(webauthnEncodedResult, userId);
    return res.status(200).json({ message: 'success', token });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});
```

We have everything we need, now let's make some changes on client side to call this new endpoint to register a user with Passkeys.

#### S1 - 3.2 Client-Side
Let's start with the registration page: `sign-up.html`

After adding the action to the signup button, we are going to initialize the Transmit SDK, check if Passkeys can be used on this device, and in this case, make some UI changes to the page.
We are going to copy 2 snippets, one below the other.

Add the following snippet to the page just below the following line (in the script declaration at the bottom):

```Javascript
btnSignup.addEventListener('click', signUpWithPassword);
```

First snippet:
```Javascript
/**
 * Initialize SDK and make required changes in the UI for passwordless
 */
const letsGoPasswordless = async () => {
  // Initialize and configure the SDK with your client.
  try {
    await window.tsPlatform.initialize({
      clientId: import.meta.env.VITE_TS_CLIENT_ID, 
      webauthn: { serverPath: import.meta.env.VITE_TS_BASE_URL }, 
    });
    console.log('TS Platform SDK initialized');

    // Check if biometrics is supported
    const isBiometricsSupported = await window.tsPlatform.webauthn.isPlatformAuthenticatorSupported();
    console.log('isBiometricsSupported', isBiometricsSupported);
    if (isBiometricsSupported) {
      btnSignup.removeEventListener('click', signUpWithPassword);
      // Remove password input and add biometrics
      document.querySelector('input[type="password"]').classList.add('hidden');
      btnSignup.getElementsByTagName('img')[0].classList.remove('hidden');
      // Add Passkey registration logic to the button
      btnSignup.addEventListener('click', signUpWithPasskey);
    }
  } catch (error) {
    console.error('Failed to initialize TS Platform SDK', error);
    showToastSync('Failed to initialize TS Platform SDK', 'error');
  }
};
// Initialize the SDK once it's loaded
document.getElementById('ts-platform-script').addEventListener('load', () => {
  letsGoPasswordless();
});
```

The missing part on the above script is the `signUpWithPasskey` method that we also have to implement. This method is the one that makes a request to our own backend to finish the Passkey registration. Paste the second snippet below the above code:

```Javascript
/**
 * Registers a user with a passkey
 */
async function signUpWithPasskey() {
  const email = document.querySelector('input[type="email"]').value;
  if (!email) {
    showToastSync('Please enter email', 'warning');
    return;
  }
  // Registers WebAuthn credentials on the device and returns an encoded result
  // that should be passed to your backend to complete the registration flow
  const encodedResult = await window.tsPlatform.webauthn.register(email);
  const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/webauthn/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webauthnEncodedResult: encodedResult,
      userId: email,
    }),
  });
  if (resp.status !== 200) {
    console.error('Failed to register');
    const error = await resp.json();
    showToastSync(error.message || 'Registration failed', 'warning');
    return;
  }

  const data = await resp.json();
  storeSaveUser(email, data.token);
  window.location.href = '/home.html';
}
```

We are done for the registration part.
Let's test how it works!

Browse to: **http://localhost:3001/sign-up.html**, add your email and try to Sign Up.
If everything went well, that it should, you have created your Passkey for this demo site. Congratulations! 🥇

### S1 - 4. Implementing the Login with Passkeys
#### S1 - 4.1 Server-Side
Move to `webinar-server`.
You remember that we created `src/services/transmitService.js` with the calls to the Transmit Platform APIs that we require to register Passkeys. Let's now add the call to authenticate with Passkeys.
Copy the following snippet in the service:

```Javascript
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
    console.log(`User authenticated: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (error) {
    console.error(`${ERROR_PASSKEY_AUTHENTICATION}: ${error.message}`);
    throw new Error(ERROR_PASSKEY_AUTHENTICATION);
  }
};
```

Now we can go to the controller and add the functionality to log in a user. Open `src/controllers/passkeysController.js` and add this new function:

```Javascript
/**
 * Authenticate a user with Passkey credentials
 * @param {String} webauthnEncodedResult Webauthn encoded result returned by authenticate() SDK call
 * @param {String} userid User identifier
 * @returns JWT token for the user
 */
const authUserPasskey = async (webauthnEncodedResult, userid) => {
  // Look up the user entry in the database
  const user = dbService.getUserByUserId(userid);

  // If found, go ahead with passkey authentication
  if (user) {
    try {
      // Authenticate with Passkey
      const clientAccessToken = await getClientAccessToken();
      const authInfo = await authPasskey(webauthnEncodedResult, clientAccessToken);
      console.log(`User authenticated: ${JSON.stringify(authInfo, null, 2)}`);

      const loginData = {
        userid,
        signInTime: Date.now(),
      };
  
      const token = jwt.sign(loginData, process.env.JWT_SECRET_KEY);
      return token;
    } catch (error) {
      console.error(`${ERROR_PASSKEY_AUTHENTICATION}: ${error.message}`);
      throw new Error(ERROR_PASSKEY_AUTHENTICATION);
    }
  } else {
    console.log('Error authenticating user: user not found');
    throw new Error(ERROR_AUTHENTICATION);
  }
};
```

You also need to import the `authPasskey` method we created above, so at the beginning, in the import section, change:
```Javascript
import { getClientAccessToken, registerPasskey } from '../services/transmitService.js';
```
by
```Javascript
import { getClientAccessToken, registerPasskey, authPasskey } from '../services/transmitService.js';
```

Don't forget to export the new method at the end of the file. Change
```Javascript
export default { registerUserPasskey };
```
by
```Javascript
export default { registerUserPasskey, authUserPasskey };
```

And finally, we only need to publish the endpoint to be consumed from the server. Open `src/routes/defaultRouter.js` and paste the following route definition:

```Javascript
// The auth-passkeys endpoint that authenticates a passkey
defaultRouter.post('/webauthn/auth', async (req, res) => {
  const { webauthnEncodedResult, userId } = req.body;
  if (!webauthnEncodedResult || !userId) return res.status(400).json({ message: 'Invalid request' });
  try {
    const token = await passkeysController.authUserPasskey(webauthnEncodedResult, userId);
    return res.status(200).json({ message: 'success', token });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});
```

#### S1 - 4.2 Client-Side
Come on, cheer up, we almost finished 🦾
We've already created everything we need in the backend to authenticate a user with a Passkey, so we are only missing to allow the user to use the Passkey to authenticate, so let's get down to business.

Open `index.html` and make sure that, at the bottom of the file, just before `<\body>`, you have already included:

```HTML
<!-- This loads the latest SDK within the major version 1. -->
<script
  src="https://platform-websdk.transmitsecurity.io/platform-websdk/latest/ts-platform-websdk.js"
  defer="true"
  id="ts-platform-script"></script>
```

First thing, we are going to replicate what we did in the Sign Up page, and create a method to be called once the Transmit Platform SDK has been initialized.
Paste the following code just after add the _click_ event listener to the button, so, after this line:
```Javascript
btnLogin.addEventListener('click', loginWithPassword);
```

Paste:

```Javascript
/**
 * Initialize SDK and make required changes in the UI for passwordless
 */
const letsGoPasswordless = async () => {
  // Initialize and configure the SDK with your client.
  try {
    await window.tsPlatform.initialize({
      clientId: import.meta.env.VITE_TS_CLIENT_ID, 
      webauthn: { serverPath: import.meta.env.VITE_TS_BASE_URL }, 
    });
    console.log('TS Platform SDK initialized');

    // Check if biometrics is supported
    const isBiometricsSupported = await window.tsPlatform.webauthn.isPlatformAuthenticatorSupported();
    console.log('isBiometricsSupported', isBiometricsSupported);
    if (isBiometricsSupported) {
      btnLogin.removeEventListener('click', loginWithPassword);
      // Remove password input and add biometrics
      document.querySelector('input[type="password"]').classList.add('hidden');
      btnLogin.getElementsByTagName('img')[0].classList.remove('hidden');
      // Add Passkey registration logic to the button
      btnLogin.addEventListener('click', loginWithPasskeyModal);
    }
  } catch (error) {
    console.error('Failed to initialize TS Platform SDK', error);
    showToastSync('Failed to initialize TS Platform SDK', 'error');
  }
};
// Initialize the SDK once it's loaded
document.getElementById('ts-platform-script').addEventListener('load', () => {
  letsGoPasswordless();
});
```

As you can see, the last 3 lines call the method after loading the script.
The method itself initializes the SDK, checks that Passkeys are supported on this device and make the same changes in the UI that we did in the Sign Up (not the best approach, but enough to understand what we are doing).

Let's now implement the new action for the **Sign In** button so that users can use their Passkeys to log in. Right after the code you pasted, add the following methods:

```Javascript
/**
 * Login with passkey
 */
async function loginWithPasskeyModal() {
  const email = document.querySelector('input[type="email"]').value;
  if (!email) {
    showToastSync('Please enter email', 'warning');
    return;
  }

  try {
    const webauthn_encoded_result = await window.tsPlatform.webauthn.authenticate.modal(email); // Optional username
    await completePasskeyLogin(webauthn_encoded_result, email);
  }
  catch (e) {
    console.error(e);
    showToastSync('Invalid user or passkey', 'warning');
  }
}

/**
 * Complete login with passkey
 * @param {string} webauthnEncodedResult Encoded result from the SDK
 * @param {string} email User email
 */
async function completePasskeyLogin(webauthnEncodedResult, email) {
  const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/webauthn/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: email, webauthnEncodedResult }),
  });
  if (resp.status !== 200) {
    console.error('Failed to login with passkey');
    showToastSync('Invalid user or passkey', 'warning');
    return;
  }

  const data = await resp.json();
  storeSaveUser(email, data.token);
  window.location.href = '/home.html';
}
```

You can see we have separated the code into 2 methods, one that calls Transmit SDK to authenticate the user using Passkeys and a second one that completes the authentication calling our backend (the endpoint `/webauthn/authn` that we built in order to finish authentication, generate user token, etc.). There is a reason behind separating the code that we will see soon, but for now, let's try authenticate with the passkey you created during the registration: Go to Login page, set our email and click the **Sign In** button. Follow the steps and... 

Congratulations!!!!
You have a Passkeys-based authentication on your website, your customers will love you! 🍻

Let's test that it works, not because we are not sure, just to realize how easy it is to log in now 🥳. 

Browse to `http://localhost:3001`, write the email address you used to register the Passkey and click Sign In button.

There it is, we have just moved from a password based authentication to a passkeys based authentication (easier, much more secure, nothing to remember...) 🚀 🚀 🚀

---

#### S1 - 4.3 Bonus track: 🚗 AUTOFILL 🚗
But wait, we are typing our email and clicking a button, but you have already seen other sites where, when you click on the input to type the email, a drop down appears offering you to choose a Passkey (or a password), and I like it even more than what we have already implemented! (many people, many minds 👽)

Okie Dokie! Let's do that too 😅

First thing first, add this function to `index.html`:

```Javascript
/**
 * Enable passkey autofill
 */
async function initPasskeyAutofill() {
  // Start autofill/conditionalUI if supported
  const isAutofillSupported = await window.tsPlatform.webauthn.isAutofillSupported();
  if (!isAutofillSupported) { 
    console.log('Autofill not supported'); 
    return;
  }

  await window.tsPlatform.webauthn.authenticate.autofill.activate({
    onSuccess: async (webauthn_encoded_result) => {
      try {
        await completePasskeyLogin(webauthn_encoded_result);
      } catch (error) {
        console.error(error);
        showToastSync('Sorry, couldn\'t sign you in', 'warning');
      }
    },
    onError: (error) => {
      console.log('Passkey autofill error: ', error);
      if (error.errorCode !== "autofill_authentication_aborted") {
        // The user doesn't exists or cannot login, redirect to register
        console.log("User doesn't exist. Sign up first");
        showToastSync('User doesn\'t exist. Sign up first', 'warning');
      }
    },
  });
}
```

This code is what we need to start using autofill (only if supported, that is the first thing we check in the function).
Now we have to call this method. Add the following lines in the `letsGoPasswordless` method after the line 
```Javascript
btnLogin.addEventListener('click', loginWithPasskeyModal);
```
paste:

```Javascript
// Start autofill/conditionalUI 
initPasskeyAutofill();
```

We also have to indicate what is the _input_ field that will get the **autofill** behavior in.
Look in the html for the _input_ with `type="email"` and change it into:

```HTML
<input class="ina-inp-txt-primary" autocomplete="username webauthn" type="email" placeholder="Email" />
```

Finally, a small detail: we built the functionality to allow a user to type the email and press the button, so let's keep it so that the user can skip the **autofill** functionality and use the button. To achieve that, we need to stop (or abort) the **autofill** when the user clicks the button:
Go to the `loginWithPasskeyModal` method and before the `try` add the following line that will abort **autofill**:

```Javascript
// Abort autofill first
await window.tsPlatform.webauthn.authenticate.autofill.abort();
```

and just in case there is any issue while trying to login using the button, start the **autofill** again. In the same method, at the end of the `catch` block, add the following:

```Javascript
// Re-start autofill/conditionalUI
initPasskeyAutofill();
```

Kudos! Autofill is now working, you only have to click on the _input_ email, but unfortunately we get an error when trying to login.
If you remember, the server is expecting a userid (we are using the _email_ in this example application), but when we enabled **autofill**, we are just sending the proof that the user has a Passkey for this application.
Let's change the server-side part to allow not only _passwordless_ but also _userid-less_.

In the `defaultRouter.js`, let's change the `/webauthn/auth` endpoint to do not fail when there is no `userId`:

```Javascript
// The auth-passkeys endpoint that authenticates a passkey
defaultRouter.post('/webauthn/auth', async (req, res) => {
  const { webauthnEncodedResult, userId } = req.body;
  if (!webauthnEncodedResult) return res.status(400).json({ message: 'Invalid request' });
  try {
    const token = await passkeysController.authUserPasskey(webauthnEncodedResult, userId);
    return res.status(200).json({ message: 'success', token });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});
```

Now let's move to `passkeysController.js`, concretely to the `authUserPasskey` function.
Here, the first thing we are checking is whether the user exists or not, and we are doing it based on the `userid` param, but now this parameter is kinda optional.
Let's rebuild the function so that it can use the `userid` when it's provided and get it from the passkey authentication response if not:

```Javascript
/**
 * Authenticate a user with Passkey credentials
 * @param {String} webauthnEncodedResult Webauthn encoded result returned by authenticate() SDK call
 * @param {String} userid User identifier (optional)
 * @returns JWT token for the user
 */
const authUserPasskey = async (webauthnEncodedResult, userid) => {
  try {
    // Authenticate with Passkey first
    const clientAccessToken = await getClientAccessToken();
    const authInfo = await authPasskey(webauthnEncodedResult, clientAccessToken);
    console.log(`User authenticated: ${JSON.stringify(authInfo, null, 2)}`);

    // If no userid is provided, look up the userid from the authInfo (id_token)
    if (!userid) {
      const { id_token } = authInfo;
      const decodedToken = await validateToken(id_token);
      console.log(`Decoded id_token: ${JSON.stringify(decodedToken, null, 2)}`);
      userid = decodedToken?.webauthn?.username;

      if (!userid) {
        console.error('Error authenticating user: user not found');
        throw new Error(ERROR_AUTHENTICATION);
      }
    }

    // Look up the user entry in the database
    const user = dbService.getUserByUserId(userid);
    if (!user) {
      console.error('Error authenticating user: user not found');
      throw new Error(ERROR_AUTHENTICATION);
    }

    const loginData = {
      userid,
      signInTime: Date.now(),
    };

    const token = jwt.sign(loginData, process.env.JWT_SECRET_KEY);
    return { token, userid };
  } catch (error) {
    console.error(`${ERROR_PASSKEY_AUTHENTICATION}: ${error.message}`);
    throw new Error(ERROR_PASSKEY_AUTHENTICATION);
  }
};
```

To decode the token, we have decided to make a simple validation (to make sure it's a token generated by Transmit Platform, and not from someone else 😈).
Add the validation code to the `transmitService.js` file:

Import the following at the top:
```Javascript
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
```

And add these two methods:
```Javascript
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
```

and don't forget to import the `validateToken` function in `passkeysController.js`, so open it again and, in the import section at the beginning, change:
```Javascript
import { getClientAccessToken, registerPasskey, authPasskey } from '../services/transmitService.js';
```
by:
```Javascript
import { getClientAccessToken, registerPasskey, authPasskey, validateToken } from '../services/transmitService.js';
```

The last detail (promised), is the fact that when using **autofill** we do not have the `email` of the user in the client app, so we are going to send it from the server together with the authentication token.
If you look at the `return` in `authUserPasskey` function you just revised, we are now returning both, the `token` and the `userid`.

Let's modify the code in `defaultRouter.js` to also return both values to the client app:

```Javascript
// The auth-passkeys endpoint that authenticates a passkey
defaultRouter.post('/webauthn/auth', async (req, res) => {
  const { webauthnEncodedResult, userId } = req.body;
  if (!webauthnEncodedResult) return res.status(400).json({ message: 'Invalid request' });
  try {
    const { token, userid } = await passkeysController.authUserPasskey(webauthnEncodedResult, userId);
    return res.status(200).json({ message: 'success', token, email: userid });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});
```

And now, in the client app, go to `index.html`, look for `completePasskeyLogin` function and replace:
```Javascript
storeSaveUser(email, data.token);
``` 
by
```Javascript
storeSaveUser(data.email, data.token);
``` 
This way we use the `userid` value from server.

Browse to `http://localhost:3001`, but this time, click on the *input* where you can type your email and a modal should appear with a break down of the passkeys you have already created for this application. Click the one you created and marvel at the great experience 💃

And now yes, you have your passwordless site (with the password login still active for the devices that cannot use Passkeys). Congratulations!!! 🍻🍻🍻🍻🍻🍻

```
                 _                           _ _     _   _ _   
 _   _  ___  ___| |  _   _  ___  _   _    __| (_) __| | (_) |_ 
| | | |/ _ \/ __| | | | | |/ _ \| | | |  / _` | |/ _` | | | __|
| |_| |  __/\__ \_| | |_| | (_) | |_| | | (_| | | (_| | | | |_ 
 \__, |\___||___(_)  \__, |\___/ \__,_|  \__,_|_|\__,_| |_|\__|
 |___/               |___/                                     
```

