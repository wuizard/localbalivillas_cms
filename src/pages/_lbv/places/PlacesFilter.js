import React, { useEffect, useState } from "react"
import { Button, InputAdornment, MenuItem, Stack, TextField } from "@mui/material"
import { SearchOutlined } from "@ant-design/icons"
import { loadLocation, loadRegion } from "services/regionService"

// The filter keeps region/location as { label, value, data } options so the
// list request can keep reading `.value` (the region / location _id).
function PlacesFilter ({
    filter,
    onChangeFilter,
    onClear
}) {

    const [ regions, setRegions ] = useState([])
    const [ locations, setLocations ] = useState([])

    useEffect(() => {
        getRegion()
    }, [])

    useEffect(() => {
        // Only the region drives the location list. Watching the whole filter
        // fired a locations request on every keystroke in the name field.
        if (filter.region) { getLocation() } else { setLocations([]) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.region])

    const getRegion = async () => {
        let regionList = []
        let { data } = await loadRegion()
        if (data) {
            for (let i = 0; i < data.length; i ++) {
                regionList.push({
                    label: data[i].regionName,
                    value: data[i]._id,
                    data: data[i]
                })
            }
        }
        setRegions(regionList)
    }

    const getLocation = async () => {
        let locationList = []
        let { data } = await loadLocation(filter.region ? filter.region.data.regionId : '')
        if (data) {
            for (let i = 0; i < data.length; i ++) {
                locationList.push({
                    label: data[i].locationName,
                    value: data[i]._id,
                    data: data[i]
                })
            }
        }
        setLocations(locationList)
    }

    const hasFilter = !!(filter.name || filter.region || filter.location)

    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ px: 2.5, pb: 2 }}
        >
            <TextField
                size="small"
                placeholder="Search place name"
                value={filter.name || ''}
                onChange={(e) => { onChangeFilter({ name: e.target.value }) }}
                sx={{ flexGrow: 1 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchOutlined style={{ fontSize: '0.9rem' }} />
                        </InputAdornment>
                    )
                }}
            />
            <TextField
                select
                size="small"
                value={filter.region ? filter.region.value : ''}
                SelectProps={{ displayEmpty: true }}
                sx={{ minWidth: 170 }}
                onChange={(e) => {
                    // A location from the old region would silently narrow the
                    // list to nothing, so it is cleared with the region.
                    onChangeFilter({
                        region: regions.find(region => region.value === e.target.value) || null,
                        location: null
                    })
                }}
            >
                <MenuItem value="">All regions</MenuItem>
                {regions.map(region => (
                    <MenuItem key={region.value} value={region.value}>{region.label}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                size="small"
                disabled={!filter.region}
                value={filter.location ? filter.location.value : ''}
                SelectProps={{ displayEmpty: true }}
                sx={{ minWidth: 190 }}
                onChange={(e) => {
                    onChangeFilter({ location: locations.find(location => location.value === e.target.value) || null })
                }}
            >
                <MenuItem value="">{filter.region ? 'All locations' : 'Select a region first'}</MenuItem>
                {locations.map(location => (
                    <MenuItem key={location.value} value={location.value}>{location.label}</MenuItem>
                ))}
            </TextField>
            <Button
                color="secondary"
                onClick={onClear}
                disabled={!hasFilter}
                sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, flexShrink: 0 }}
            >
                Clear
            </Button>
        </Stack>
    )
}

export default PlacesFilter
