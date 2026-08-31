import React, { useEffect, useState } from "react"
import { Alert, Box, Button, Chip, Grid, Stack, useMediaQuery } from "@mui/material"
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel"
import LBVCalendar from "components/LBVCalendar";

function RoomsSchedule ({
    hideTitle,
    disabledDate,
    setDisableDay,
    vertical
}) {

    // Two months side by side need ~660px. Below that the picker overflows whatever
    // column it is in and drags its nav bar across the page, so drop to a single
    // stacked month instead. `useMediaQuery` rather than window.innerWidth so it
    // still responds when the window is resized.
    const isNarrow = useMediaQuery('(max-width:900px)')
    const stacked = vertical || isNarrow

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

                    <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                        <Chip
                            size="small"
                            label={blocked.length === 0
                                ? 'No dates closed'
                                : `${blocked.length} date${blocked.length > 1 ? 's' : ''} closed`}
                            sx={blocked.length === 0
                                ? { bgcolor: 'secondary.lighter', color: 'text.secondary', fontWeight: 500 }
                                : { bgcolor: 'error.lighter', color: 'error.main', fontWeight: 500 }}
                        />
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
                <Box
                    sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        py: 1,
                        // The picker is a fixed-width block, so the box scrolls rather
                        // than letting it push the whole page wider than the screen.
                        // Not a flex container: as a flex item the picker collapses to
                        // its minimum instead of keeping its natural month width.
                        overflowX: 'auto',
                        '& .rdrDefinedRangesWrapper': { display: 'none' },
                        '& .rdrDateRangePickerWrapper': {
                            width: 'fit-content',
                            margin: '0 auto'
                        }
                    }}
                >
                    <LBVCalendar
                        price={null}
                        month={stacked ? 1 : 2}
                        onChange={(e) => {
                            onChange({ disabledDate: e, startDate: null, endDate: null })
                        }}
                        vertical={stacked}
                        dates={form.disabledDate}
                    />
                </Box>
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
