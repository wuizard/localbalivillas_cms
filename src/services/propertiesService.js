import { client, errorValidation, LONG_WRITE_TIMEOUT } from "./service";

export const getProperty = async function (id) {
  try {
    let response = await client.get(`/property/${id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    let data = response.data.data;
    return { data };
  } catch (e) {
    // return { error: e.response.data.errorCode }
    return errorValidation(e)
  }
}

export const getProperties = async function ({
  name,
  region,
  location,
  page,
  status
}) {
  try {
      let response = await client.get(`/properties/list?name=${name || ''}&region=${region || ''}&location=${location || ''}&page=${page}&status=${status || ''}`);
      if (response.data.statusCode !== 200) { throw response.data.data; }
      let data = response.data.data;
      return { data };
    } catch (e) {
      // return { error: e.response.data.errorCode }
      return errorValidation(e)
    }
}

export const getPropertiesId = async function () {
  try {
    let response = await client.get(`/properties/list-id`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    let data = response.data.data;
    return { data };
  } catch (e) {
    // return { error: e.response.data.errorCode }
    return errorValidation(e)
  }
}

export const createProperties = async function (body) {
  try {
    let response = await client.post(`/create-properties`, {
        ...body
    }, { timeout: LONG_WRITE_TIMEOUT });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    let data = response.data.data;
    return { data };
  } catch (e) {
    // return { error: e.response.data.errorCode }
    return errorValidation(e)
  }
}

export const updateProperties = async function (body) {
  try {
    let response = await client.post(`/update-properties`, {
        ...body
    }, { timeout: LONG_WRITE_TIMEOUT });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    let data = response.data.data;
    return { data };
  } catch (e) {
    // return { error: e.response.data.errorCode }
    return errorValidation(e)
  }
}

export const deleteProperties = async function (propertiesId) {
  try {
    let response = await client.delete(`/delete-properties/${propertiesId}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    let data = response.data.data;
    return { data };
  } catch (e) {
    // return { error: e.response.data.errorCode }
    return errorValidation(e)
  }
}

export const hideProperties = async function (propertiesId) {
  try {
    let response = await client.put(`/hide-properties/${propertiesId}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    let data = response.data.data;
    return { data };
  } catch (e) {
    // return { error: e.response.data.errorCode }
    return errorValidation(e)
  }
}