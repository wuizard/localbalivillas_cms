import React from "react";
import { Button, Grid } from "@mui/material";
import { LBVInput, LBVSelect } from "components/_lbvcomponents/LBVInput";
import { ORDER_STATUS } from "./activityOrderStatus";

const STATUS_FILTER_OPTIONS = [{ value: '', label: 'All statuses' }, ...ORDER_STATUS];

function ActivityOrderFilter({ filter, onChangeFilter, onClear }) {
    const hasFilter = !!(filter.search || filter.date || filter.status)

    return (
        <Grid container spacing={1.5} alignItems="flex-end">
            <Grid item xs={12} md={4}>
                <LBVInput
                    label="Search"
                    placeHolder="Order id, guest, activity"
                    value={filter.search || ''}
                    onChange={(e) => onChangeFilter({ search: e.currentTarget.value })}
                    enterAction={() => onChangeFilter({ search: filter.search || '' })}
                />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                {/* LBVSelect does not forward `isClearable` to react-select, so an
                    explicit "All" row is the only way to unset this field without
                    clearing the whole filter. */}
                <LBVSelect
                    label="Status"
                    options={STATUS_FILTER_OPTIONS}
                    value={filter.status || STATUS_FILTER_OPTIONS[0]}
                    onChange={(e) => onChangeFilter({ status: e && e.value ? e : null })}
                />
            </Grid>

            {/* Departure date, not booking date. What the team searches for is "who is
                going out on Saturday", not "who booked on Tuesday". */}
            <Grid item xs={12} sm={6} md={3}>
                <LBVInput
                    label="Departure date"
                    type="date"
                    value={filter.date}
                    selectedDate={filter.date ? new Date(filter.date) : null}
                    monthsShown={1}
                    onChange={(date) => onChangeFilter({ date })}
                />
            </Grid>

            <Grid item xs={12} md={2}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    disabled={!hasFilter}
                    onClick={onClear}
                >
                    Clear
                </Button>
            </Grid>
        </Grid>
    )
}

export default ActivityOrderFilter;
