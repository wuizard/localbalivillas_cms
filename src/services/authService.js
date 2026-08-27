import { client, errorValidation } from "./service";

export const loginService = async function ({
    username, password
}) {
    try {
        let response = await client.post(`/login`, {
            username, password
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const logoutService = async function ({
    adminId
}) {
    try {
        let response = await client.put(`/logout/${adminId}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const getMe = async function ({
    _id
}) {
    try {
        let response = await client.get(`/me/${_id}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}