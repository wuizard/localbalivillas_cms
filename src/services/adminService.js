import { client, errorValidation } from "./service";

export const getAdminList = async function () {
    try {
        let response = await client.get(`/admins`);
        console.log('here response', response)
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const createAdmin = async function ({
    name, username, password, role, isActive
}) {
    try {
        let response = await client.post(`/create-admin`, {
            name, username, password, role, isActive
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const updateAdmin = async function ({
    _id, name, username, password, role, isActive
}) {
    try { 
        let response = await client.post(`/update-admin`, {
            _id, name, username, password, role, isActive
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const deleteAdmin = async function ({
    adminId
}) {
    try {
        let response = await client.delete(`/delete-admin/${adminId}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}