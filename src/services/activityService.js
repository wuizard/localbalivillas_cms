import { client, errorValidation, LONG_WRITE_TIMEOUT } from "./service";

export const getActivities = async function ({ name, category, region, status, page } = {}) {
  try {
    let response = await client.get(
      `/activities?name=${name || ''}&category=${category || ''}&region=${region || ''}&status=${status || ''}&page=${page || 0}`
    );
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const getActivity = async function (id) {
  try {
    let response = await client.get(`/activity/${id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const createActivity = async function (body) {
  try {
    let response = await client.post(`/create-activity`, { ...body }, { timeout: LONG_WRITE_TIMEOUT });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const updateActivity = async function (body) {
  try {
    let response = await client.post(`/update-activity`, { ...body }, { timeout: LONG_WRITE_TIMEOUT });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const hideActivity = async function ({ _id }) {
  try {
    let response = await client.put(`/hide-activity/${_id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const deleteActivity = async function ({ _id }) {
  try {
    let response = await client.delete(`/delete-activity/${_id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}
