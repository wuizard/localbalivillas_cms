import { client, errorValidation } from "./service";

export const loadRegion = async function () {
    try {
      let response = await client.get(`/regions`);
      if (response.data.statusCode !== 200) { throw response.data.data; }
      let data = response.data.data;
      return { data };
    } catch (e) {
      // return { error: e.response.data.errorCode }
      return errorValidation(e)
    }
}

export const createRegion = async function (body) {
    try {
        let response = await client.post(`/create-region`, {
            ...body
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const updateRegion = async function (body) {
    try {
        let response = await client.post(`/update-region`, {
            ...body
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const deleteRegionService = async function (regionId) {
    try {
        let response = await client.delete(`/delete-region/${regionId}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const loadLocation = async function (regionId) {
    try {
        let response = await client.get(`/locations?regionid=${regionId || ''}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
      } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
      }
}

export const createLocation = async function (body) {
    try {
        let response = await client.post(`/create-location`, {
            ...body
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const updateLocation = async function (body) {
    try {
        let response = await client.post(`/update-location`, {
            ...body
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}