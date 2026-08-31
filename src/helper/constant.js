export const dayOptions = [
    {
        label: "Sunday",
        value: "Sun",
        number: 0,
    },
    {
        label: "Monday",
        value: "Mon",
        number: 1,
    },
    {
        label: "Tuesday",
        value: "Tue",
        number: 2,
    },
    {
        label: "Wednesday",
        value: "Wed",
        number: 3,
    },
    {
        label: "Thursday",
        value: "Thu",
        number: 4,
    },
    {
        label: "Friday",
        value: "Fri",
        number: 5,
    },
    {
        label: "Saturday",
        value: "Sat",
        number: 6,
    }
]

export const locationOptions = [
    {label: 'Bali', value: 'bali'},
    {label: 'Lombok', value: 'lombok'}
]

export const typeOptions = [
    {label: 'Villas', value: 'villas'},
    {label: 'Hotels', value: 'hotels'},
    {label: 'Resorts', value: 'resorts'},
    {label: 'Bamboo House', value: 'bamboo_house'}
]

export const color = {
    // Primary used color
    primary: "#957c64",
    green: "#536942",
    // Other Color
    green_success: "#4DBD74",
    green_whatsapp: "#25d366"
}

export const incrementNumber = (e, digit = 5) => {
    let value = ''
    let max = 10
    for (let i = 0; i < digit; i ++) {
        let number = (i + 1) * max
        if ( e < number ) {
            for (let j = 0; j < (digit - i); j ++) {
                value += '0'
            }
            value = `${value}${e}`
            break;
        }
    }
    return value
}

export const statusOptions = [
    { value: "waiting_confirmation", label: "Waiting Confirmation"},
    { value: "confirmed", label: "Confirmed"},
    { value: "checkout", label: "Check Out"},
    { value: "refund", label: "Refund"},
    { value: "reject", label: "Reject"}
]

export const couponTypeOptions = [
    { value: "percentage", label: "Percentage"},
    { value: "nominal", label: "Nominal"}
]

export const couponUsageOptions = [
    { value: "total", label: "Total Order"},
    { value: "night", label: "Night(s)"}
]
// What a promo code may be spent on. Coupons created before activities existed have
// no value stored; the API reads that as "villas", which is the only checkout that
// existed at the time.
export const couponAppliesToOptions = [
    { value: "villas", label: "Villas only"},
    { value: "activities", label: "Activities only"},
    { value: "both", label: "Villas and activities"}
]
