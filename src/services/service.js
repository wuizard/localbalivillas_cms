// import { deleteUserInfo } from 'helper/localStorage';
// import { getUserInfo } from 'helper/localStorage';
// import { Action, Confirm } from 'helper/showAlert';
// import { toast } from 'react-toastify';

// const Axios = require('axios');

import axios from "axios";
import { reactLocalStorage } from "reactjs-localstorage";
const Axios = axios

export const TOKEN_KEY = 'lbv_admin_token';

export const getToken = () => {
  try {
    return reactLocalStorage.get(TOKEN_KEY) || '';
  } catch (e) {
    return '';
  }
};

export const clearSession = () => {
  try {
    reactLocalStorage.clear();
  } catch (e) {
    // Nothing to do — the redirect below still gets them to the login screen.
  }
};

// Production unless REACT_APP_API_BASE_URL says otherwise. Set that in a local
// .env.local (gitignored) to point at a local or staging API without editing this
// file and risking the override reaching a deploy.
export const client = Axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://lbv-api.wuebuild.com/admin',
  headers: {
    'Content-Type': 'application/json',
  },
  // 10s was aborting property saves that the server had in fact completed, which
  // is how retries ended up creating duplicate properties.
  timeout: 30000,
});

// Property writes touch several collections and can legitimately outrun the
// default. Pass this to the two endpoints that need it rather than raising the
// timeout for every call.
export const LONG_WRITE_TIMEOUT = 120000;

// Read at request time, not at module load: the token does not exist yet when this
// module is first evaluated on the login screen.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) { config.headers['x-access-token'] = token; }
  return config;
});

// The API now rejects an unknown or revoked token with 401. Sitting on a dead
// session shows empty tables and silent failures, so end it and go to the login
// screen - except on the login request itself, where 401 means wrong credentials
// and the form has to show that.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error && error.response && error.response.status;
    const url = (error && error.config && error.config.url) || '';
    if (status === 401 && url.indexOf('/login') < 0) {
      clearSession();
      if (window.location.pathname !== '/login') { window.location.href = '/login'; }
    }
    return Promise.reject(error);
  },
);

export const errorValidation = (e) => {
  try {
    if (e.response.status === 405) { 
      // deleteUserInfo()
    //   Action("", "You've been logged out. Please login again.", () => {
    //     window.location.href = "/"
    //   })
    }
    if (e.response.status === 403) { 
      // deleteUserInfo()
    }
    console.log('here error', e.response)
    return { error: e.response.data.message || "Failed to fetch data" };
  } catch (error) {
    // toast('There is problem with server connection', {
    //   toastId: "error-api",
    //   type: "error"
    // });
    // Confirm("", "There is problem with server connection")
    return { error: "Failed to fetch data"}
  }
}

// export const login = async function (body) {
//   try {
//     let response = await client.post('/login', {
//       phoneNumber: body.phoneNumber || ""
//     });
//     if (response.data.statusCode !== 200) { throw response.data.data; }
//     let data = response.data.data;
//     return { data };
//   } catch (e) {
//     return { error: e.response.data.errorCode };
//   }
// }

// export const registerUser = async function(body) {
//   try {
//     let response = await client.post(`/register-user/${body._id}`, {
//       name: body.name || "",
//       phoneNumber: body.phoneNumber || "",
//       gender: body.gender || "", // Male
//     });
//     if (response.data.statusCode !== 200) { throw response.data.data; }
//     let data = response.data.data;
//     return { data };
//   } catch (e) {
//     return { error: e.response.data.errorCode };
//   }
// };

