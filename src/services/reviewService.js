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
