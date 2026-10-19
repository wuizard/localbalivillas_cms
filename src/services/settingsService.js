import { client, errorValidation } from "./service";

// { paymentGateway: 'xendit' | 'doku', providers: [{ name, configured }] }
export const getPaymentSettings = async function () {
    try {
        let response = await client.get(`/settings/payment`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        return { data: response.data.data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const updatePaymentSettings = async function ({ paymentGateway }) {
    try {
        let response = await client.put(`/settings/payment`, { paymentGateway });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        return { data: response.data.data };
    } catch (e) {
        return errorValidation(e)
    }
}
