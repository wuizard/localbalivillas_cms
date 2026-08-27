import { client, errorValidation } from "./service";

export const getCouponList = async function () {
    try {
        let response = await client.get(`/coupons`);
        console.log('here response', response)
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}

export const getCoupon = async function ({
    couponId
}) {
    try {
        let response = await client.get(`/coupon/${couponId}`);
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const createCoupon = async function ({
    name, couponCode, couponType, amount, minimumPurchase, minimumDays,
    startDate, endDate, limit, limitUser, user, propertyId, termsCondition
}) {
    try {
        let response = await client.post(`/coupon/create`, {
            name, couponCode, couponType, amount, minimumPurchase, minimumDays,
            startDate, endDate, limit, limitUser, user, propertyId, termsCondition
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const updateCoupon = async function ({
    _id, name, couponCode, couponType, couponUsage, amount, minimumPurchase, minimumDays,
    startDate, endDate, limit, limitUser, user, propertyId, termsCondition
}) {
    try {
        let response = await client.post(`/coupon/update`, {
            _id, name, couponCode, couponType, couponUsage, amount, minimumPurchase, minimumDays,
            startDate, endDate, limit, limitUser, user, propertyId, termsCondition
        });
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        // return { error: e.response.data.errorCode }
        return errorValidation(e)
    }
}

export const deleteCoupon = async function ({
    _id
}) {
    try {
        let response = await client.delete(`/coupon/delete/${_id}`);
        console.log('here response', response)
        if (response.data.statusCode !== 200) { throw response.data.data; }
        let data = response.data.data;
        return { data };
    } catch (e) {
        return errorValidation(e)
    }
}