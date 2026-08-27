import { Button, Card, Grid } from "@mui/material";
import { LBVInput, LBVSelect } from "components/_lbvcomponents/LBVInput";
import { couponTypeOptions, couponUsageOptions } from "helper/constant";
import React, { useEffect, useState } from "react";
import { createCoupon, getCoupon, updateCoupon } from "services/couponService";
import { getPropertiesId } from "services/propertiesService";
import { useParams } from 'react-router-dom';
import moment from "moment";
import { LBVLabel } from "components/_lbvcomponents/LBVLabel";
import ReactQuill from "react-quill";
import { NumericFormat } from "react-number-format";

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }]
];

function CouponDetail () {

    const [ form, setForm ] = useState({
        propertyId: null,
        name: null,
        couponCode: null,
        couponType: couponTypeOptions[0], // percentage, nominal
        couponUsage: couponUsageOptions[0], // percentage, nominal
        minimumPurchase: null,
        minimumDays: null,
        startDate: moment(new Date()).format('YYYY-MM-DD'),
        endDate: moment(new Date()).format('YYYY-MM-DD'),
        limit: null,
        limitUser: null,
        amount: null,
        user: null,
        autoPopup: false,
        isActive: true,
        termsCondition: ""
    })
    const [ properties, setProperties ] = useState([])
    const [ users, setUsers ] = useState([])
    const [ loading, setLoading ] = useState(false)

    // load properties Id
    const { id } = useParams();

    useEffect(() => {
        loadProperties()
        if (id) {
            loadCouponDetail(id)
        }
    }, [])

    const loadCouponDetail = async (id) => {
        try {
            let { data, error } = await getCoupon({
                couponId: id
            })
            if (error) { throw error }
            if (data) { 
                let couponType = couponTypeOptions[0]
                let couponUsage = couponUsageOptions[0]
                if (data.couponType) {
                    for (let i = 0; i < couponTypeOptions.length; i ++) {
                        if (couponTypeOptions[i].value == data.couponType) {
                            couponType = couponTypeOptions[i];
                            break;
                        }
                    }
                }
                if (data.couponUsage) {
                    for (let i = 0; i < couponUsageOptions.length; i ++) {
                        if (couponUsageOptions[i].value == data.couponUsage) {
                            couponUsage = couponUsageOptions[i];
                            break;
                        }
                    }
                }
                setForm({
                    ...data,
                    startDate: moment(data.startDate).format('YYYY-MM-DD'),
                    endDate: moment(data.endDate).format('YYYY-MM-DD'),
                    propertyId: data.propertyId ? data.propertyId.map( value => {
                        return { value: value._id, label: value.name }
                    }) : null,
                    couponType: couponType,
                    couponUsage: couponUsage
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    const loadProperties = async () => {
        let { data, error } = await getPropertiesId()
        if (data) { 
            let newData = []
            for (let i = 0; i < data.length; i ++) {
                newData.push({
                    label: data[i].name,
                    value: data[i]._id
                })
            }
            setProperties([...newData])
        }
    }

    // const loadUsers = async () => {

    // }

    const onChange = (e) => {
        setForm((prev) => ({
            ...prev,
            ...e
        }))
    }

    const saveCoupon = async () => {
        setLoading(true)
        try {
            if (form._id) {
                let { data, error } = await updateCoupon({
                    ...form,
                    couponType: form.couponType ? form.couponType.value : null,
                    couponUsage: form.couponUsage ? form.couponUsage.value : null,
                    propertyId: form.propertyId ? form.propertyId.map(value => { return value.value }) : null
                })
                if (error) { throw error; }
                if (data) { 
                    window.location.replace(`/coupons/${data._id}`)
                }
            } else {
                let { data, error } = await createCoupon({
                    ...form,
                    couponType: form.couponType ? form.couponType.value : null,
                    couponUsage: form.couponUsage ? form.couponUsage.value : null,
                    propertyId: form.propertyId ? form.propertyId.map(value => { return value.value }) : null
                })
                if (error) { throw error; }
                if (data) { 
                    window.location.replace(`/coupons/${data._id}`)
                }
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }

    return (
        <Grid container xs={12} lg={4}>
            <Card>
                <Grid container xs={12} lg={12} p={2} spacing={1}>
                    <Grid item xs={12}>
                        <LBVInput label={"Coupon Name"} onChange={(e) => {
                            onChange({name: e.currentTarget.value})
                        }} value={form.name}/>
                    </Grid>
                    <Grid item xs={12}>
                        <LBVInput label={"Coupon Code"} onChange={(e) => {
                            onChange({couponCode: e.currentTarget.value.toUpperCase()})
                        }}  value={form.couponCode}/>
                    </Grid>
                    <Grid item xs={12}>
                        <LBVSelect label={"Coupon Usage"} options={couponUsageOptions} onChange={(e) => {
                            onChange({couponUsage: e})
                        }} value={form.couponUsage}/>
                    </Grid>
                    <Grid item xs={12}>
                        <LBVSelect label={"Coupon Type"} options={couponTypeOptions} onChange={(e) => {
                            onChange({couponType: e, amount: 0})
                        }} value={form.couponType}/>
                    </Grid>
                    <Grid item xs={12}>
                        {/* <LBVInput label={"Amount"} onChange={(e) => {
                            onChange({amount: e.currentTarget.value.replace(/\D/g, "")})
                        }} value={form.amount}/> */}
                        <NumericFormat value={form.amount}
                            isAllowed={(values) => {
                                const {floatValue} = values;
                                if (form.couponType.value == "percentage") { 
                                    if (floatValue > 100) { return false }
                                }
                                return true
                            }}
                            onValueChange={(values) => {
                                const {formattedValue, value, floatValue} = values;
                                // do something with floatValue
                                onChange({ amount: value.replace(/^0+/, '') })
                            }}
                            // disabled={form._id}
                            decimalScale={0}
                            allowLeadingZeros={false}
                            allowedDecimalSeparators={false}
                            allowNegative={false}
                            thousandSeparator
                            customInput={LBVInput}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <LBVSelect label={"Properties"} isMulti={true} options={properties} onChange={(e) => {
                            onChange({propertyId: e})
                        }} value={form.propertyId}/>
                    </Grid>
                    <Grid item xs={6}>
                        {/* <LBVInput label={"Minimum Purchase"} onChange={(e) => {
                            onChange({minimumPurchase: e.currentTarget.value.replace(/\D/g, "")})
                        }} value={form.minimumPurchase}/> */}
                        <LBVLabel style={{
                            color: 'rgb(133, 133, 133)'
                        }}>Minimum Purchase</LBVLabel>
                        <NumericFormat value={form.minimumPurchase}
                            onValueChange={(values) => {
                                const {formattedValue, value, floatValue} = values;
                                // do something with floatValue
                                onChange({ minimumPurchase: value.replace(/^0+/, '') })
                            }}
                            decimalScale={0}
                            allowLeadingZeros={false}
                            allowedDecimalSeparators={false}
                            allowNegative={false}
                            thousandSeparator
                            customInput={LBVInput}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <LBVInput label={"Minimum Day Stay"} onChange={(e) => {
                            if ((e.currentTarget.value * 1) > 10) { return }
                            onChange({minimumDays: e.currentTarget.value.replace(/\D/g, "")})
                        }} value={form.minimumDays}/>
                    </Grid>
                    <Grid item xs={6}>
                        <LBVInput type={"date"} monthsShown={1} label={"Start Date"} onChange={(e) => {
                            onChange({startDate: e})
                        }} value={form.startDate}/>
                    </Grid>
                    <Grid item xs={6}>
                        <LBVInput type={"date"} monthsShown={1} label={"End Date"} onChange={(e) => {
                            onChange({endDate: e})
                        }} value={form.endDate}/>
                    </Grid>
                    <Grid item xs={6}>
                        <LBVInput label={"Limit Usage"} onChange={(e) => {
                            onChange({limit: e.currentTarget.value.replace(/\D/g, "")})
                        }} value={form.limit}/>
                    </Grid>
                    <Grid item xs={6}>
                        <LBVInput label={"Limit per User"} onChange={(e) => {
                            onChange({limitUser: e.currentTarget.value.replace(/\D/g, "")})
                        }} value={form.limitUser}/>
                    </Grid>
                    {/* <Grid item xs={12}>
                        <LBVSelect label={"User"} options={[]} onChange={(e) => {
                            onChange({user: e})
                        }} isMulti={true} value={form.user}/>
                    </Grid> */}
                    <Grid item xs={12} >
                        <LBVLabel style={{fontSize: 13, color: "rgb(133, 133, 133)"}}>Terms and Condition</LBVLabel>
                        <ReactQuill theme="snow" style={{
                            background: 'white'
                        }} value={form.termsCondition}
                            modules={{toolbar: toolbarOptions}}
                            onChange={(e) => {
                                onChange({termsCondition: e})
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                        <Button variant="contained" 
                        disabled={
                            !form.amount ||
                            !form.startDate || !form.endDate ||
                            !form.couponCode || !form.name || loading
                        }
                        onClick={() => {
                            saveCoupon()
                        }}>{form._id ? "Update" : "Create"}</Button>
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    )
}

export default CouponDetail