import { client, errorValidation } from "./service";

// Asks the backend for a short-lived, single-object S3 URL. The browser never
// holds an AWS credential.
export const presignUpload = async function ({ contentType, dirName, size }) {
  try {
    let response = await client.post(`/upload/presign`, {
      contentType, dirName, size
    });
    if (response.data.statusCode !== 200) { throw response.data.data; }
    let data = response.data.data;
    return { data };
  } catch (e) {
    return errorValidation(e)
  }
}
