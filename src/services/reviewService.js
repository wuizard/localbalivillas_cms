import { client, errorValidation } from "./service";

export const getReviews = async function ({ search, rating, propertyId, page } = {}) {
  try {
    let response = await client.get(
      `/reviews?search=${search || ''}&rating=${rating || ''}&propertyId=${propertyId || ''}&page=${page || 0}`
    );
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

// Issues (or hands back) the review link for a booking. `bookingId` accepts either
// the booking's own id or the B17… reference the guest sees.
export const createReviewLink = async function (bookingId) {
  try {
    let response = await client.post(`/review-link`, { bookingId });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const getReviewLinks = async function (bookingId) {
  try {
    let response = await client.get(`/review-links?bookingId=${bookingId || ''}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}

export const revokeReviewLink = async function (id) {
  try {
    let response = await client.delete(`/review-link/${id}`);
    if (response.data.statusCode !== 200) { throw response.data.data; }
    return { data: response.data.data };
  } catch (e) {
    return errorValidation(e)
  }
}
