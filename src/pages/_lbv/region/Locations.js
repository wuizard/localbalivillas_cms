import React, { useEffect, useMemo, useState } from "react"

import {
    Box,
    Button,
    Chip,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material"
import { EditOutlined, SearchOutlined } from "@ant-design/icons"
import { toast } from "react-toastify"
import moment from "moment"

import MainCard from "components/MainCard"
import { LBVInput, LBVSelect } from "components/_lbvcomponents/LBVInput"
import { createLocation, loadLocation, loadRegion, updateLocation } from "services/regionService"

const emptyForm = () => ({
    _id: null,
    region: null,
    regionId: '',
    locationName: '',
    locationId: ''
})

function Location () {

    const [ form, setForm ] = useState(emptyForm())

    const [ locationData, setLocationData ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ saving, setSaving ] = useState(false)
    const [ regions, setRegions ] = useState([])

    const [ search, setSearch ] = useState('')
    const [ regionFilter, setRegionFilter ] = useState('')

    useEffect(() => {
        loadLocationList()
        getRegion()
    }, [])

    useEffect(() => {
        // The id encodes its region, so it is only generated while creating -
        // editing keeps the id the location was given.
        if (form.region && !form._id) { generateLocationId() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.region, form._id])

    const getRegion = async () => {
        let regionList = []
        let { data, error } = await loadRegion()
        if (error) { toast.error(error) }
        if (data) {
            for (let i = 0; i < data.length; i ++) {
                regionList.push({
                    label: data[i].regionName,
                    value: data[i]._id,
                    data: data[i]
                })
            }
            setRegions(regionList)
        }
    }

    const loadLocationList = async () => {
        setLoading(true)
        let { data, error } = await loadLocation()
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setLocationData(data) }
    }

    const generateLocationId = async () => {
        let total = 0
        let { data, error } = await loadLocation(form.region.data.regionId)
        if (error) { toast.error(error) }
        if (data) { total = data.length }
        setForm(prev => ({
            ...prev,
            locationId: `${form.region.data.regionId}-${total + 1}`
        }))
    }

    const onChange = (e) => {
        setForm(prev => ({
            ...prev,
            ...e
        }))
    }

    const startEdit = (location) => {
        setForm({
            _id: location._id,
            // Show which region the location belongs to instead of a blank select.
            region: regions.find(region => region.data.regionId === location.regionId) || null,
            regionId: location.regionId,
            locationName: location.locationName,
            locationId: location.locationId
        })
    }

    const saveLocation = async () => {
        setSaving(true)
        let isEdit = !!form._id
        let { data, error } = isEdit
            ? await updateLocation({
                ...form,
                regionId: form.regionId ? form.regionId : form.region.data.regionId
            })
            : await createLocation({
                locationName: form.locationName,
                locationId: form.locationId,
                regionId: form.region.data.regionId
            })
        setSaving(false)
        if (error) { toast.error(error) }
        if (data) {
            toast.success(isEdit ? "Location updated" : "Location created")
            setForm(emptyForm())
            loadLocationList()
        }
    }

    const visibleLocations = useMemo(() => {
        let keyword = search.trim().toLowerCase()
        return locationData
            .filter(location => {
                if (regionFilter && location.regionId !== regionFilter) { return false }
                if (!keyword) { return true }
                return `${location.locationName} ${location.locationId}`.toLowerCase().indexOf(keyword) > -1
            })
            // Grouped by region, then alphabetical - the API order interleaves both.
            .sort((a, b) => {
                let regionA = (a.region && a.region.regionName) || ''
                let regionB = (b.region && b.region.regionName) || ''
                if (regionA !== regionB) { return regionA.localeCompare(regionB) }
                return (a.locationName || '').localeCompare(b.locationName || '')
            })
    }, [locationData, search, regionFilter])

    const isEditing = !!form._id
    const canSave = !!form.locationName.trim() && !!form.locationId && (isEditing ? !!form.regionId : !!form.region)

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">Locations</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Areas within a region - Seminyak, Ubud, Canggu - that properties are listed under.
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12} md={5} lg={4}>
                <MainCard title={isEditing ? "Edit Location" : "Add Location"}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <LBVSelect
                                label={"Region"}
                                placeHolder={"Select a region"}
                                value={form.region}
                                options={regions}
                                disabled={isEditing}
                                showInfo={isEditing ? "A location cannot be moved to another region" : null}
                                onChange={(e) => {
                                    onChange({region: e})
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput
                                label={"Location Name"}
                                placeHolder={"e.g. Seminyak"}
                                value={form.locationName}
                                onChange={(e) => {
                                    onChange({locationName: e.currentTarget.value})
                                }}
                                enterAction={() => { if (canSave) { saveLocation() } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput
                                label={"Location Id"}
                                disabled={true}
                                value={form.locationId}
                                showInfo={isEditing ? "The id stays with the location" : "Generated from the selected region"}
                            />
                        </Grid>
                        <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                            {
                                isEditing &&
                                <Grid item>
                                    <Button color="secondary" variant="outlined" onClick={() => {
                                        setForm(emptyForm())
                                    }}>
                                        Cancel
                                    </Button>
                                </Grid>
                            }
                            <Grid item>
                                <Button variant="contained" disabled={saving || !canSave} onClick={saveLocation}>
                                    {isEditing ? "Update Location" : "Create Location"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </MainCard>
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
                <MainCard
                    title="All Locations"
                    content={false}
                    secondary={
                        <Typography variant="caption" color="textSecondary">
                            {`${visibleLocations.length} of ${locationData.length}`}
                        </Typography>
                    }
                >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ px: 2.5, pb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search name or id"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value) }}
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
                            value={regionFilter}
                            onChange={(e) => { setRegionFilter(e.target.value) }}
                            SelectProps={{ displayEmpty: true }}
                            sx={{ minWidth: 190 }}
                        >
                            <MenuItem value="">All regions</MenuItem>
                            {regions.map(region => (
                                <MenuItem key={region.value} value={region.data.regionId}>{region.label}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    {/* The table keeps its own scroll so narrow screens never widen the page. */}
                    <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Location Name</TableCell>
                                <TableCell>Location Id</TableCell>
                                <TableCell>Region</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                !loading && !visibleLocations.length &&
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                                            {locationData.length ? "No location matches this search." : "No locations yet - add the first one on the left."}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                visibleLocations.map(location => (
                                    <TableRow key={location._id} hover selected={form._id === location._id}>
                                        <TableCell>
                                            <Typography variant="subtitle2">{location.locationName}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">{location.locationId}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={(location.region && location.region.regionName) || '-'}
                                                sx={{ bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {moment(location.createdDate).format('DD MMM YYYY')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit location">
                                                <IconButton size="small" color="primary" onClick={() => { startEdit(location) }}>
                                                    <EditOutlined />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                    </Box>
                </MainCard>
            </Grid>
        </Grid>
    )
}

export default Location
