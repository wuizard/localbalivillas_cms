import { client, errorValidation } from "./service";

export const getEnquiries = async function ({ kind, status, source, search, reference, page } = {}) {
  try {
    let response = await client.get(
      `/enquiries?kind=${kind || ''}&status=${status || ''}&source=${source || ''}&search=${search || ''}&reference=${reference || ''}&page=${page || 0}`
    );
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const getEnquiry = async function (id) {
  try {
    let response = await client.get(`/enquiry/${id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const updateEnquiryStatus = async function (body) {
  try {
    let response = await client.post(`/enquiry/status`, { ...body });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}
