import { client, errorValidation, LONG_WRITE_TIMEOUT } from "./service";

export const getEventPackages = async function ({ name, status } = {}) {
  try {
    let response = await client.get(`/event-packages?name=${name || ''}&status=${status || ''}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const getEventPackage = async function (id) {
  try {
    let response = await client.get(`/event-package/${id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const createEventPackage = async function (body) {
  try {
    let response = await client.post(`/create-event-package`, { ...body }, { timeout: LONG_WRITE_TIMEOUT });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const updateEventPackage = async function (body) {
  try {
    let response = await client.post(`/update-event-package`, { ...body }, { timeout: LONG_WRITE_TIMEOUT });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const deleteEventPackage = async function ({ _id }) {
  try {
    let response = await client.delete(`/delete-event-package/${_id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}
