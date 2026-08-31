import React, { useEffect, useState } from "react";
import { Box, Button, Chip, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
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

const EMPTY_FORM = {
    type: typeOptions[0],
    day: null,
    dateStart: null,
    dateEnd: null,
    price: 0,
    priceFormat: 0
}

// One rule reads as either a weekday or a date span. The stored shape differs
// depending on whether it was just entered (dateStart/dateEnd) or came back from
// the API (an expanded `date` array), so both are handled here rather than in the
// markup.
function describeRule(value) {
    if (value.day) {
        return value.day.label ? value.day.label : value.day.toString()
    }
    if (value.dateStart && value.dateEnd) {
        return `${moment(value.dateStart).format('DD MMM YYYY')} – ${moment(value.dateEnd).format('DD MMM YYYY')}`
    }
    if (value.date && value.date.length > 1) {
        const first = moment(value.date[0]).format('DD MMM YYYY')
        const last = moment(value.date[value.date.length - 1]).format('DD MMM YYYY')
        return `${first} – ${last} (${value.date.length} days)`
    }
    if (value.date && value.date.length > 0) {
        return moment(value.date[0]).format('DD MMM YYYY')
    }
    return '—'
}

function ruleKind(value) {
    if (value.day) { return 'Weekday' }
    if ((value.date && value.date.length > 0) || value.dateStart) { return 'Dates' }
    return value.type ? value.type.label : '—'
}

// Sort key: a weekday rule has no date, so it sorts to the front and stays there.
function ruleOrder(value) {
    if (value.date && value.date.length > 0) { return moment(value.date[0]).valueOf() }
    if (value.dateStart) { return moment(value.dateStart).valueOf() }
    return -Infinity
}

function RoomsPrice ({
    prices,
    hideTitle,
    setPrice
}) {

    const [ priceList, setPriceList ] = useState(prices)
    const [ type , setType ] = useState(typeOptions[0])
    const [ form, setForm ] = useState(EMPTY_FORM)

    const onChange = (e) => {
        setForm(prev => ({
            ...prev,
            ...e
        }))
    }

    // Kept as an effect, exactly as before: the parent is notified whenever the list
    // changes, including the initial push on mount. Swapping this for a direct call
    // inside add/remove would silently drop that first sync.
    useEffect(() => {
        setPrice(priceList)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceList])

    const isDay = type === typeOptions[0]

    const canAdd = Number(form.price) > 0 &&
        (isDay ? Boolean(form.day) : Boolean(form.dateStart && form.dateEnd))

    const add = () => {
        if (!canAdd) { return }
        setPriceList([...priceList, form])
        setForm({ ...EMPTY_FORM, type })
    }

    // Removes by identity, not by index. The list is displayed in date order while
    // the stored array is in insertion order, so an index taken from the rendered
    // row would delete a different rule.
    const remove = (rule) => {
        setPriceList(priceList.filter((entry) => entry !== rule))
    }

    const ordered = [...priceList].sort((a, b) => ruleOrder(a) - ruleOrder(b))

    return (
        <Grid container spacing={2}>
            {!hideTitle && (
                <Grid item xs={12}>
                    <LBVTitleLabel>Special Prices</LBVTitleLabel>
                    <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                        Any date not covered here uses the default price.
                    </LBVLabel>
                </Grid>
            )}

            <Grid item xs={12} md={2}>
                <LBVSelect label="Applies to" options={typeOptions}
                    value={type}
                    onChange={(e) => {
                        setType(e)
                        onChange({ type: e, day: null, dateStart: null, dateEnd: null })
                    }}
                />
            </Grid>

            {isDay ? (
                <Grid item xs={12} md={4}>
                    <LBVSelect label="Day" options={dayOptions}
                        value={form.day}
                        onChange={(e) => { onChange({ day: e }) }}
                    />
                </Grid>
            ) : (
                <>
                    <Grid item xs={6} md={2}>
                        <LBVInput label="From" type="date"
                            value={form.dateStart}
                            selectedDate={form.dateStart ? new Date(form.dateStart) : null}
                            monthsShown={1}
                            onChange={(date) => { onChange({ dateStart: date, startDate: date }) }}
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <LBVInput label="To" type="date"
                            value={form.dateEnd}
                            selectedDate={form.dateEnd ? new Date(form.dateEnd) : null}
                            monthsShown={1}
                            onChange={(date) => { onChange({ dateEnd: date, endDate: date }) }}
                        />
                    </Grid>
                </>
            )}

            <Grid item xs={12} md={4}>
                <LBVLabel style={{ fontSize: 13, color: 'rgb(133, 133, 133)' }}>Price</LBVLabel>
                <NumericFormat value={form.priceFormat}
                    onValueChange={(values) => {
                        const { formattedValue, value } = values;
                        onChange({
                            priceFormat: formattedValue.replace(/^0+/, ''),
                            price: value.replace(/^0+/, '')
                        })
                    }}
                    decimalScale={0}
                    allowLeadingZeros={false}
                    allowedDecimalSeparators={false}
                    allowNegative={false}
                    thousandSeparator
                    customInput={LBVInput}
                />
            </Grid>

            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button color="primary" variant="outlined" fullWidth
                    startIcon={<PlusOutlined />}
                    disabled={!canAdd}
                    onClick={add}
                >
                    Add
                </Button>
            </Grid>

            <Grid item xs={12}>
                {ordered.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                        No special prices. Every date uses the default price.
                    </Typography>
                ) : (
                    // Two or three to a row rather than one wide band each - a rule is
                    // a short label and a number, and a full-width row wastes the space
                    // while making a long list scroll further than it needs to.
                    <Grid container spacing={1}>
                        {ordered.map((value, index) => (
                            <Grid
                                item xs={12} sm={6} lg={4}
                                key={`${ruleKind(value)}-${describeRule(value)}-${index}`}
                            >
                                <Stack
                                    spacing={0.5}
                                    sx={{
                                        position: 'relative',
                                        border: '1px solid #eee',
                                        borderRadius: 1,
                                        px: 1.5,
                                        py: 1,
                                        height: '100%',
                                    }}
                                >
                                    {/* Absolute, so the button's own height cannot stretch the
                                        title row and open a gap under the title. `pr` keeps the
                                        text clear of it. */}
                                    <Tooltip title="Remove">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            sx={{ position: 'absolute', top: 4, right: 4, p: { xs: 0.75, sm: 0.5 } }}
                                            onClick={() => remove(value)}
                                        >
                                            <DeleteOutlined />
                                        </IconButton>
                                    </Tooltip>

                                    <Typography variant="subtitle2" sx={{ pr: 4, lineHeight: 1.35 }}>
                                        {describeRule(value)}
                                    </Typography>

                                    <Box>
                                        {/* Tinted background rather than MUI's saturated fill:
                                            white-on-amber measured 1.74:1, well under the 4.5:1
                                            needed to read. The tint keeps the colour coding and
                                            lands near 8:1. */}
                                        <Chip
                                            size="small"
                                            label={ruleKind(value)}
                                            sx={{
                                                fontWeight: 600,
                                                bgcolor: ruleKind(value) === 'Weekday' ? 'primary.lighter' : 'warning.lighter',
                                                color: ruleKind(value) === 'Weekday' ? 'primary.darker' : 'warning.darker',
                                            }}
                                        />
                                    </Box>

                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {currencyFormat(value.price || 0)}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Grid>
        </Grid>
    )
}

export default RoomsPrice
