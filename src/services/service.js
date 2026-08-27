// import { deleteUserInfo } from 'helper/localStorage';
// import { getUserInfo } from 'helper/localStorage';
// import { Action, Confirm } from 'helper/showAlert';
// import { toast } from 'react-toastify';

// const Axios = require('axios');

import axios from "axios";
const Axios = axios

// export const getToken = () => {
//   try {
//     let userInfo = getUserInfo ? JSON.parse(getUserInfo) : null
//     return userInfo ? userInfo.token : ''
//   } catch (e) {
//     deleteUserInfo()
//     return ''
//   }
// }

export const client = Axios.create({
  baseURL: 'https://lbv-api.wuebuild.com/admin',
  // baseURL: 'http://localhost:5200/admin',
  // baseURL: 'https://lbv-staging-api.wuebuild.com/admin',
  headers: {
    'Content-Type': 'application/json',
    // 'x-access-token': getToken()
  },
  // 10s was aborting property saves that the server had in fact completed, which
  // is how retries ended up creating duplicate properties.
  timeout: 30000,
});

// Property writes touch several collections and can legitimately outrun the
// default. Pass this to the two endpoints that need it rather than raising the
// timeout for every call.
export const LONG_WRITE_TIMEOUT = 120000;

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

