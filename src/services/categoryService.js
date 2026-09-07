import { client, errorValidation } from "./service";

export const getCategories = async function ({ activeOnly } = {}) {
    try {
        let response = await client.get(`/categories?activeOnly=${activeOnly ? 'true' : ''}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        return { data: response.data.data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const createCategory = async function (body) {
    try {
        let response = await client.post(`/create-category`, { ...body });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        return { data: response.data.data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const updateCategory = async function (body) {
    try {
        let response = await client.post(`/update-category`, { ...body });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        return { data: response.data.data };
    } catch (e) {
        return errorValidation(e)
    }
}

// Takes the ids in their new display order.
export const reorderCategories = async function (ids) {
    try {
        let response = await client.post(`/reorder-categories`, { ids });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        return { data: response.data.data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const deleteCategory = async function (categoryId) {
    try {
        let response = await client.delete(`/delete-category/${categoryId}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        return { data: response.data.data };
    } catch (e) {
        return errorValidation(e)
    }
}
