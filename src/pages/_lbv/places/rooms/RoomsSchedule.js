import React, { useEffect, useState } from "react"
import { Card, Grid, Button } from "@mui/material"
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel"
import { LBVInput } from "components/_lbvcomponents/LBVInput"
import moment from "moment";
import LBVCalendar from "components/LBVCalendar";

function RoomsSchedule ({
    hideTitle,
    disabledDate,
    setDisableDay,
    vertical
}) {

    const [ form, setForm ] = useState({
        dateStart: null,
        dateEnd: null,
        disabledDate: disabledDate ? disabledDate : []
    })

    const onChange = (e) => {
        setForm(prev => ({
            ...prev,
            ...e,
        }))
    }

    useEffect(() => {
        setDisableDay(form.disabledDate)
    }, [form.disabledDate])

    return (
        <Grid>
            {
                !hideTitle && <LBVTitleLabel>Disable Dates</LBVTitleLabel>
            }
            {/* <Grid container xs={12}>
                <Grid item container xs={12} md={8} spacing={1}> 
                    <Grid item xs={0} md={3}>
                        <LBVLabel style={{marginTop: 8}}>Set Disable Date</LBVLabel>
                    </Grid>
                    <Grid item xs={12} md>
                        <LBVInput value={form.dateStart} 
                            style={{weekStart: 1}}
                            type="date" 
                            onChange={(e) => {
                                onChange({dateStart: e})
                            }}
                            inputProps={{
                                InputProps: {
                                    // inputProps: { min: moment(new Date()).format("YYYY-MM-DD"), max: checkAdvancedDays()}
                                    inputProps: { min: moment(new Date()).format("YYYY-MM-DD") }
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md>
                        <LBVInput value={form.dateEnd} 
                            style={{weekStart: 1}}
                            type="date" 
                            onChange={(e) => {
                                onChange({dateEnd: e})
                            }}
                            inputProps={{
                                InputProps: {
                                    // inputProps: { min: moment(new Date()).format("YYYY-MM-DD"), max: checkAdvancedDays()}
                                    inputProps: { min: moment(new Date()).format("YYYY-MM-DD") }
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs>
                        <Button color="primary" variant="contained" onClick={() => {
                            let days = calculateDays({startDate: form.dateStart, endDate: form.dateEnd})
                            console.log(days)
                            onChange({ disabledDate: days, startDate: null, endDate: null })
                        }}>Add</Button>
                    </Grid>
                </Grid>
            </Grid> */}
            <Grid container mt={1}>
                <LBVCalendar 
                    price={null}
                    month={2}
                    onChange={(e) => {
                        onChange({ disabledDate: e, startDate: null, endDate: null })
                    }}
                    vertical={vertical}
                    dates={form.disabledDate}
                />
            {/* {
                form.disabledDate && form.disabledDate.map( (value, index) => {
                    return (
                        <Grid item xs={6} md={3}>
                            <Card>
                                <Grid container p={1}>
                                    <Grid item xs>{value}</Grid>
                                    <Grid item xs={1} onClick={() => {
                                            console.log('hello world')
                                            const disableDates = form.disabledDate
                                            disableDates.splice(index, 1)
                                            onChange({ disabledDate: [...disableDates], startDate: null, endDate: null })
                                        }}
                                        style={{cursor: 'pointer'}}
                                    >x</Grid>
                                </Grid>
                            </Card>
                        </Grid>
                    )
                })
            } */}
            </Grid>
        </Grid>
    )
}

function calculateDays({
    startDate,
    endDate
}){
    let range = moment(endDate) - moment(startDate)
    let dateRange = Math.round(range / (1000 * 3600 * 24))
    console.log(dateRange, startDate, endDate)
    let days = []
    for (let i = 0; i <= dateRange; i ++) {
        days.push(moment(startDate).add(i, 'day').format('YYYY-MM-DD'))
    }
    return days
}

export default RoomsSchedule