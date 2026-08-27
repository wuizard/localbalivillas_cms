import { client, errorValidation } from "./service";

export const loadUser = async function () {
    try {
      let response = await client.get(`/users`);
      if (response.data.statusCode !== 200) { throw response.data.data; }
      let data = response.data.data;
      return { data };
    } catch (e) {
      // return { error: e.response.data.errorCode }
      return errorValidation(e)
    }
}