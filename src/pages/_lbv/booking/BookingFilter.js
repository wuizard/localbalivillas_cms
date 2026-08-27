import React, { useEffect, useState } from "react"
import { Button, Grid } from "@mui/material"
import { LBVInput, LBVSelect } from "components/_lbvcomponents/LBVInput"
import { statusOptions } from "helper/constant"
import { loadUser } from "services/userService"

function BookingFilter ({
    filter,
    onChangeFilter,
    onClear
}) {

    const [ userList, setUserList ] = useState([])

    useEffect(() => {
        loadUserList()
    }, [])

    const loadUserList = async () => {
        let listUsers = []
        let { data } = await loadUser()
        if (data) {
            for (let i = 0; i < data.length; i ++) {
                listUsers.push({
                    label: data[i].name,
                    value: data[i]._id
                })
            }
        }
        setUserList(listUsers)
    }

    const hasFilter = !!(
        filter.bookingId ||
        filter.user ||
        filter.checkinDate ||
        filter.checkoutDate ||
        (filter.status && filter.status.length)
    )

    return (
        <Grid container spacing={1.5} sx={{ px: 2.5, pb: 2 }} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
                <LBVInput label={"Booking Id"}
                    value={filter.bookingId}
                    placeHolder="Search booking id"
                    onChange={(e) => {
                        onChangeFilter({bookingId: e.currentTarget.value})
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <LBVSelect label={"Guest"}
                    options={userList}
                    value={filter.user}
                    placeHolder="All guests"
                    onChange={(e) => {
                        onChangeFilter({user: e})
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <LBVInput type={"date"} label={"Check in from"}
                    value={filter.checkinDate || ''}
                    onChange={(e) => {
                        onChangeFilter({checkinDate: e})
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <LBVInput type={"date"} label={"Check out until"}
                    value={filter.checkoutDate || ''}
                    onChange={(e) => {
                        onChangeFilter({checkoutDate: e})
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
                <LBVSelect label={"Status"}
                    isMulti={true}
                    value={filter.status}
                    placeHolder="Any status"
                    options={statusOptions}
                    onChange={(e) => {
                        onChangeFilter({status: e})
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={4} md={3} textAlign={"right"}>
                <Button color="secondary" onClick={onClear} disabled={!hasFilter}>Clear filters</Button>
            </Grid>
        </Grid>
    )
}

export default BookingFilter
