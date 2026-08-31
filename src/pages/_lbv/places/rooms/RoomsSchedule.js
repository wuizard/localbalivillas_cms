import React, { useEffect, useState } from "react"
import { Alert, Button, Grid, Stack, Typography } from "@mui/material"
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel"
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.disabledDate])

    const blocked = form.disabledDate || []

    return (
        <Grid container spacing={1.5}>
            <Grid item xs={12}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1}
                >
                    <div>
                        {!hideTitle && <LBVTitleLabel>Disable Dates</LBVTitleLabel>}
                        <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                            Click a date to close it. Click again to reopen it.
                        </LBVLabel>
                    </div>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="textSecondary">
                            {blocked.length === 0
                                ? 'No dates closed'
                                : `${blocked.length} date${blocked.length > 1 ? 's' : ''} closed`}
                        </Typography>
                        {blocked.length > 0 && (
                            <Button size="small" color="error" variant="outlined"
                                onClick={() => { onChange({ disabledDate: [], startDate: null, endDate: null }) }}
                            >
                                Clear all
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <LBVCalendar
                    price={null}
                    month={2}
                    onChange={(e) => {
                        onChange({ disabledDate: e, startDate: null, endDate: null })
                    }}
                    vertical={vertical}
                    dates={form.disabledDate}
                />
            </Grid>

            <Grid item xs={12}>
                <Alert severity="info">
                    A closed date cannot be booked. Prices are unaffected — set those under
                    Special Prices.
                </Alert>
            </Grid>
        </Grid>
    )
}

export default RoomsSchedule
