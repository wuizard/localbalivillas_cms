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

export const logoutService = async function () {
    try {
        // The server drops the presented token from the admin's token list, so it
        // stops working immediately rather than lingering until it expires.
        let response = await client.post(`/logout`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const getMe = async function () {
    try {
        let response = await client.get(`/me`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}