import React, { useState } from "react";
import { Box, Button, Chip, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { NumericFormat } from "react-number-format";
import moment from "moment";

import { LBVInput, LBVSelect } from "components/_lbvcomponents/LBVInput";
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel";
import { dayOptions } from "helper/constant";
import { currencyFormat } from "helper/numberHelper";

const typeOptions = [
    { label: "Day of week", value: "day" },
    { label: "Specific dates", value: "date" },
];

const EMPTY_FORM = {
    type: typeOptions[0],
    day: null,
    dateStart: null,
    dateEnd: null,
    adultPrice: 0,
    childPrice: 0,
};

/**
 * Special prices for an activity. Same shape as the room price editor - a weekday
 * rule or a date-range rule - with one difference: an activity is priced per head,
 * so a rule carries an adult and a child rate together. Entering a weekend surcharge
 * once for both is the point; two separate rules would drift apart.
 *
 * The base rate is not edited here. It lives on the activity, and a second copy of it
 * would give the resolver two places to disagree.
 */
function ActivityPrices({ priceList = [], setPriceList }) {
    const [form, setForm] = useState(EMPTY_FORM)

    const onChange = (patch) => setForm((prev) => ({ ...prev, ...patch }))

    const isDay = form.type.value === 'day'

    const canAdd = Number(form.adultPrice) > 0 &&
        (isDay ? Boolean(form.day) : Boolean(form.dateStart && form.dateEnd))

    const add = () => {
        if (!canAdd) { return }

        setPriceList([
            ...priceList,
            isDay
                ? {
                    day: [form.day.label],
                    date: null,
                    adultPrice: Number(form.adultPrice),
                    childPrice: Number(form.childPrice) || 0,
                }
                : {
                    day: null,
                    dateStart: form.dateStart,
                    dateEnd: form.dateEnd,
                    adultPrice: Number(form.adultPrice),
                    childPrice: Number(form.childPrice) || 0,
                },
        ])

        setForm({ ...EMPTY_FORM, type: form.type })
    }

    const removeAt = (index) => setPriceList(priceList.filter((_, i) => i !== index))

    const describe = (rule) => {
        if (Array.isArray(rule.day) && rule.day.length > 0) { return `Every ${rule.day.join(', ')}` }
        if (rule.dateStart && rule.dateEnd) {
            return `${moment(rule.dateStart).format('D MMM YYYY')} – ${moment(rule.dateEnd).format('D MMM YYYY')}`
        }
        if (Array.isArray(rule.date) && rule.date.length > 0) {
            return rule.date.length === 1
                ? moment(rule.date[0]).format('D MMM YYYY')
                : `${moment(rule.date[0]).format('D MMM YYYY')} – ${moment(rule.date[rule.date.length - 1]).format('D MMM YYYY')} (${rule.date.length} days)`
        }
        return 'Base rate'
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <LBVTitleLabel>Special prices</LBVTitleLabel>
                <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                    Anything not covered here uses the base rate above.
                </LBVLabel>
            </Grid>

            <Grid item xs={12} md={2}>
                <LBVSelect label="Applies to" options={typeOptions}
                    value={form.type}
                    onChange={(e) => onChange({ type: e, day: null, dateStart: null, dateEnd: null })} />
            </Grid>

            {isDay ? (
                <Grid item xs={12} md={3}>
                    <LBVSelect label="Day" options={dayOptions}
                        value={form.day}
                        onChange={(e) => onChange({ day: e })} />
                </Grid>
            ) : (
                <>
                    <Grid item xs={6} md={2}>
                        <LBVInput label="From" type="date"
                            value={form.dateStart}
                            selectedDate={form.dateStart ? new Date(form.dateStart) : null}
                            monthsShown={1}
                            onChange={(date) => onChange({ dateStart: date })} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <LBVInput label="To" type="date"
                            value={form.dateEnd}
                            selectedDate={form.dateEnd ? new Date(form.dateEnd) : null}
                            monthsShown={1}
                            onChange={(date) => onChange({ dateEnd: date })} />
                    </Grid>
                </>
            )}

            <Grid item xs={6} md={2}>
                <LBVLabel style={{ fontSize: 13, color: 'rgb(133, 133, 133)' }}>Adult (IDR)</LBVLabel>
                <NumericFormat
                    value={form.adultPrice}
                    thousandSeparator="."
                    decimalSeparator=","
                    customInput={LBVInput}
                    onValueChange={({ value }) => onChange({ adultPrice: value })}
                />
            </Grid>

            <Grid item xs={6} md={2}>
                <LBVLabel style={{ fontSize: 13, color: 'rgb(133, 133, 133)' }}>Child (IDR)</LBVLabel>
                <NumericFormat
                    value={form.childPrice}
                    thousandSeparator="."
                    decimalSeparator=","
                    customInput={LBVInput}
                    onValueChange={({ value }) => onChange({ childPrice: value })}
                />
            </Grid>

            <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button variant="outlined" startIcon={<PlusOutlined />} disabled={!canAdd} onClick={add}>
                    Add
                </Button>
            </Grid>

            <Grid item xs={12}>
                {priceList.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                        No special prices. Every date uses the base rate.
                    </Typography>
                ) : (
                    <Grid container spacing={1}>
                        {priceList.map((rule, index) => (
                            <Grid item xs={12} sm={6} lg={4} key={index}>
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
                                    <Tooltip title="Remove">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            sx={{ position: 'absolute', top: 4, right: 4, p: { xs: 0.75, sm: 0.5 } }}
                                            onClick={() => removeAt(index)}
                                        >
                                            <DeleteOutlined />
                                        </IconButton>
                                    </Tooltip>

                                    <Typography variant="subtitle2" sx={{ pr: 4, lineHeight: 1.35 }}>
                                        {describe(rule)}
                                    </Typography>

                                    <Box>
                                        <Chip
                                            size="small"
                                            label={Array.isArray(rule.day) && rule.day.length ? 'Weekday' : 'Dates'}
                                            sx={{
                                                fontWeight: 600,
                                                bgcolor: Array.isArray(rule.day) && rule.day.length
                                                    ? 'primary.lighter' : 'warning.lighter',
                                                color: Array.isArray(rule.day) && rule.day.length
                                                    ? 'primary.darker' : 'warning.darker',
                                            }}
                                        />
                                    </Box>

                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {currencyFormat(rule.adultPrice)} adult
                                        {rule.childPrice ? ` · ${currencyFormat(rule.childPrice)} child` : ''}
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

export default ActivityPrices;
