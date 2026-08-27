import React, { useEffect, useState } from "react"

import {
    Box,
    Button,
    Chip,
    Dialog,
    Grid,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material"
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { toast } from "react-toastify"

import MainCard from "components/MainCard"
import { LBVInput } from "components/_lbvcomponents/LBVInput"
import { incrementNumber } from "helper/constant"
import { createRegion, deleteRegionService, loadLocation, loadRegion, updateRegion } from "services/regionService"

// A blank form always carries the next free region id, so "Create" is ready to
// go the moment the page loads or an edit is cancelled.
const emptyForm = (regionCount) => ({
    _id: null,
    regionName: '',
    regionId: `ID${incrementNumber(regionCount + 1, 4)}`
})

function Region () {

    const [ form, setForm ] = useState(emptyForm(0))

    const [ regionData, setRegionData ] = useState([])
    const [ locationData, setLocationData ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ saving, setSaving ] = useState(false)
    const [ deleteDialog, setDeleteDialog ] = useState({ open: false, region: null })

    useEffect(() => {
        loadRegionList()
    }, [])

    const loadRegionList = async () => {
        setLoading(true)
        // Locations come along so each region can show how much is riding on it.
        let [ regionResult, locationResult ] = await Promise.all([loadRegion(), loadLocation()])
        setLoading(false)
        if (regionResult.error) { toast.error(regionResult.error) }
        if (locationResult.data) { setLocationData(locationResult.data) }
        if (regionResult.data) {
            setRegionData(regionResult.data)
            setForm(emptyForm(regionResult.data.length))
        }
    }

    const onChange = (e) => {
        setForm(prev => ({
            ...prev,
            ...e
        }))
    }

    const locationCount = (region) => locationData.filter(location => location.regionId === region.regionId).length

    const saveRegion = async () => {
        setSaving(true)
        let isEdit = !!form._id
        let { data, error } = isEdit
            ? await updateRegion(form)
            : await createRegion({ regionName: form.regionName, regionId: form.regionId })
        setSaving(false)
        if (error) { toast.error(error) }
        if (data) {
            toast.success(isEdit ? "Region updated" : "Region created")
            loadRegionList()
        }
    }

    const deleteRegion = async () => {
        let region = deleteDialog.region
        setDeleteDialog({ open: false, region: null })
        let { data, error } = await deleteRegionService(region._id)
        if (error) { toast.error(error) }
        if (data) { toast.success("Region deleted"); loadRegionList() }
    }

    const isEditing = !!form._id

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">Regions</Typography>
                    <Typography variant="body2" color="textSecondary">
                        The top level of the destination tree - every location, and through it every property, sits under a region.
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12} md={5} lg={4}>
                <MainCard title={isEditing ? "Edit Region" : "Add Region"}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <LBVInput
                                label={"Region Name"}
                                placeHolder={"e.g. Bali"}
                                value={form.regionName}
                                onChange={(e) => {
                                    onChange({regionName: e.currentTarget.value})
                                }}
                                enterAction={() => { if (form.regionName.trim()) { saveRegion() } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput
                                label={"Region Id"}
                                disabled={true}
                                value={form.regionId}
                                showInfo={isEditing ? "The id stays with the region" : "Generated automatically"}
                            />
                        </Grid>
                        <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                            {
                                isEditing &&
                                <Grid item>
                                    <Button color="secondary" variant="outlined" onClick={() => {
                                        setForm(emptyForm(regionData.length))
                                    }}>
                                        Cancel
                                    </Button>
                                </Grid>
                            }
                            <Grid item>
                                <Button
                                    variant="contained"
                                    disabled={saving || !form.regionName.trim()}
                                    onClick={saveRegion}
                                >
                                    {isEditing ? "Update Region" : "Create Region"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </MainCard>
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
                <MainCard
                    title="All Regions"
                    content={false}
                    secondary={
                        <Typography variant="caption" color="textSecondary">
                            {`${regionData.length} region${regionData.length === 1 ? '' : 's'}`}
                        </Typography>
                    }
                >
                    {/* The table keeps its own scroll so narrow screens never widen the page. */}
                    <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Region Name</TableCell>
                                <TableCell>Region Id</TableCell>
                                <TableCell>Locations</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                !loading && !regionData.length &&
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                                            No regions yet - add the first one on the left.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                regionData.map(region => (
                                    <TableRow
                                        key={region._id}
                                        hover
                                        selected={form._id === region._id}
                                    >
                                        <TableCell>
                                            <Typography variant="subtitle2">{region.regionName}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">{region.regionId}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={locationCount(region)}
                                                sx={{ bgcolor: 'secondary.lighter', color: 'text.primary', fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="Edit region">
                                                    <IconButton size="small" color="primary" onClick={() => {
                                                        setForm({
                                                            _id: region._id,
                                                            regionName: region.regionName,
                                                            regionId: region.regionId
                                                        })
                                                    }}>
                                                        <EditOutlined />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete region">
                                                    <IconButton size="small" color="error" onClick={() => {
                                                        setDeleteDialog({ open: true, region })
                                                    }}>
                                                        <DeleteOutlined />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                    </Box>
                </MainCard>
            </Grid>

            <Dialog open={deleteDialog.open} onClose={() => { setDeleteDialog({ open: false, region: null }) }}>
                <Grid container p={2.5} spacing={2} sx={{ maxWidth: 420 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>Delete region?</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {`"${deleteDialog.region ? deleteDialog.region.regionName : ''}" will be removed. This cannot be undone.`}
                        </Typography>
                        {
                            deleteDialog.region && locationCount(deleteDialog.region) > 0 &&
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {`${locationCount(deleteDialog.region)} location${locationCount(deleteDialog.region) === 1 ? ' is' : 's are'} still assigned to it.`}
                            </Typography>
                        }
                    </Grid>
                    <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                        <Grid item>
                            <Button color="secondary" variant="outlined" onClick={() => {
                                setDeleteDialog({ open: false, region: null })
                            }}>Cancel</Button>
                        </Grid>
                        <Grid item>
                            <Button color="error" variant="contained" onClick={deleteRegion}>Delete</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default Region
