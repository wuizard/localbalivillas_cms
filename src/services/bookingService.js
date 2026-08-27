import { client, errorValidation } from "./service";

export const getBookings = async function ({
    bookingId, user, checkinDate, checkoutDate, status, page
}) {
    try {
        let response = await client.get(`/orders?bookingId=${bookingId || ''}&user=${user || ''}&checkinDate=${checkinDate || ''}&checkoutDate=${checkoutDate || ''}&status=${status || ''}&page=${page || 0}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const getBooking = async function (id) {
    try {
        let response = await client.get(`/order/${id}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
      } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
      }
}

export const confirmBooking = async function ({
    id
}) {
    try {
        let response = await client.get(`/order/confirm-order?_id=${id}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const rejectBooking = async function ({
    id
}) {
    try {
        let response = await client.get(`/order/reject-order?_id=${id}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const refundBooking = async function ({
    id
}) {
    try {
        let response = await client.get(`/order/refund-order?_id=${id}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const checkOutBooking = async function ({
    id
}) {
    try {
        let response = await client.get(`/order/checkout-order?_id=${id}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}