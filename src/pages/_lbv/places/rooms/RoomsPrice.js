import React, { useEffect, useState } from "react";
import { Card, Button, Grid } from "@mui/material";
import { LBVInput, LBVSelect } from "../../../../components/_lbvcomponents/LBVInput";
import { LBVLabel, LBVTitleLabel } from "../../../../components/_lbvcomponents/LBVLabel";
import { dayOptions } from "../../../../helper/constant";
import moment from "moment/moment";
import { NumericFormat } from "react-number-format";
import { currencyFormat } from "../../../../helper/numberHelper";


const typeOptions = [
    { label: "Day", value: "day" },
    { label: "Date", value: "date" },
]

function RoomsPrice ({
    prices,
    hideTitle,
    setPrice
}) {

    const [ priceList, setPriceList ] = useState(prices)
    const [ type , setType ] = useState(typeOptions[0])
    // const [ formSchedule, setFormSchedule ] = useState({
    //     startDate: null,
    //     endDate: null
    // })
    const [ form, setForm ] = useState({
        type: typeOptions[0],
        day: null,
        dateStart: null,
        dateEnd: null,
        price: 0,
        priceFormat: 0
    })

    const onChange = (e) => {
        console.log(e)
        setForm(prev => ({
            ...prev,
            ...e
        }))
    }

    useEffect(() => {
        setPrice(priceList)
    }, [priceList])

    return (
        <Grid container xs={12}>
            <Grid item xs={12} md={12} spacing={2}>
                {
                    !hideTitle && <LBVTitleLabel>Special Prices</LBVTitleLabel>
                }
                <Grid item container xs={12} spacing={1}>
                    <Grid item xs={12} md={2}>
                        <LBVSelect options={typeOptions}
                            value={type}
                            onChange={(e) => {
                                setType(e)
                                onChange({
                                    type: e
                                })
                            }}
                         />
                    </Grid>
                    <Grid item container xs={12} md>
                        {
                            type == typeOptions[0] &&
                            <Grid item xs={12} md> 
                                <LBVSelect
                                    options={dayOptions}
                                    onChange={(e) => {
                                        onChange({
                                            day: e
                                        })
                                    }}
                                />
                            </Grid>
                        }
                        {
                            type == typeOptions[1] &&
                            <Grid item container xs={12} md spacing={1}> 
                                <Grid item xs={6}>
                                    <LBVInput value={form.startDate} 
                                        style={{weekStart: 1}}
                                        styles={{
                                            width: '100%'
                                        }}
                                        type="date" 
                                        onChange={(e) => {
                                            onChange({dateStart: e, startDate: e})
                                        }}
                                        inputProps={{
                                            InputProps: {
                                                // inputProps: { min: moment(new Date()).format("YYYY-MM-DD"), max: checkAdvancedDays()}
                                                inputProps: { min: moment(new Date()).format("YYYY-MM-DD") },
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <LBVInput value={form.endDate} 
                                        style={{weekStart: 1}}
                                        type="date" 
                                        onChange={(e) => { onChange({dateEnd: e, endDate: e}) }}
                                        inputProps={{
                                            InputProps: {
                                                // inputProps: { min: moment(new Date()).format("YYYY-MM-DD"), max: checkAdvancedDays()}
                                                inputProps: { min: moment(new Date()).format("YYYY-MM-DD") }
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        }
                    </Grid>
                    <Grid item>
                        <NumericFormat value={form.priceFormat}
                            onValueChange={(values) => {
                                const {formattedValue, value, floatValue} = values;
                                // do something with floatValue
                                onChange({ priceFormat: formattedValue.replace(/^0+/, ''), price: value.replace(/^0+/, '') })
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
                    <Grid item xs>
                        <Button color="primary" variant="contained" onClick={() => {
                            let currPriceList = priceList
                            currPriceList.push(form)
                            setPriceList([...currPriceList])
                            setForm({
                                type: typeOptions[0],
                                day: null,
                                dateStart: null,
                                dateEnd: null,
                                price: 0,
                                priceFormat: 0
                            })
                        }}>Add</Button>
                    </Grid>
                </Grid>
            </Grid>
            {
                (priceList && priceList.length > 0) &&
                <Grid item container mt={2} spacing={1}>
                    {
                        priceList.sort((a, b) => (a.date ? moment(a.date[0]) : moment(a.dateStart)) - (b.date ? moment(b.date[0]) : moment(b.dateStart)) ).map((value, index) => {
                            return (
                                <Grid item>
                                    <Card>
                                        <Grid container p={1} spacing={0.5}>
                                            <Grid item container xs={11}>
                                                <Grid item>
                                                {
                                                    value.type && 
                                                    <LBVLabel>Type : {value.type ? value.type.label : ''}</LBVLabel>
                                                }
                                                {
                                                    (value.date && value.date.length > 0) &&
                                                    <LBVLabel>Type : Date</LBVLabel>
                                                }
                                                {
                                                    (value.day && value.day.length > 0) &&
                                                    <LBVLabel>Type : Day</LBVLabel>
                                                }
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <LBVLabel>
                                                        {value.day ? value.day.label ? value.day.label : value.day.toString() : ''}
                                                    </LBVLabel>
                                                    {
                                                        value.dateStart &&
                                                        <LBVLabel>
                                                            {`${moment(value.dateStart).format('DD-MM-YYYY')} - ${moment(value.dateEnd).format('DD-MM-YYYY')}`}
                                                        </LBVLabel>
                                                    }
                                                    {
                                                        (value.date && value.date.length > 1) ?
                                                        <LBVLabel>
                                                            {`${moment(value.date[0]).format('DD-MM-YYYY')} - ${moment(value.date[value.date.length - 1]).format('DD-MM-YYYY')}`}
                                                        </LBVLabel>
                                                        :
                                                        (value.date && value.date.length > 0) ?
                                                        <LBVLabel>
                                                            {`${moment(value.date[0]).format('DD-MM-YYYY')}`}
                                                        </LBVLabel>
                                                        :
                                                        ''
                                                    }
                                                </Grid>
                                            </Grid>
                                            <Grid item sx={{
                                                cursor: 'pointer'
                                            }} onClick={() => {
                                                let priceListInfo = priceList
                                                priceListInfo.splice(index, 1)
                                                console.log('new Price', priceListInfo)
                                                setPriceList([...priceListInfo])
                                            }}>
                                                <LBVLabel bold>X</LBVLabel>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <LBVLabel>{currencyFormat(value.price || 0)}</LBVLabel>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                </Grid>
                            )
                        })
                    }
                </Grid>
            }
        </Grid>
    )
}

export default RoomsPrice