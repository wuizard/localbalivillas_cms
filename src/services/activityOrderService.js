import { client, errorValidation } from "./service";

export const getActivityOrders = async function ({ status, search, date, page } = {}) {
  try {
    let response = await client.get(
      `/activity-orders?status=${status || ''}&search=${search || ''}&date=${date || ''}&page=${page || 0}`
    );
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const getActivityOrder = async function (id) {
  try {
    let response = await client.get(`/activity-order/${id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const updateActivityOrderStatus = async function (body) {
  try {
    let response = await client.post(`/activity-order/status`, { ...body });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}
