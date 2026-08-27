import React, { useEffect, useState } from "react"

import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Tabs,
    Tooltip,
    Typography
} from "@mui/material"
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

import { deleteProperties, getProperties, hideProperties } from "services/propertiesService"
import MainCard from "components/MainCard"
import PlacesFilter from "./PlacesFilter"

import { useDebounce } from 'use-debounce'
import { toast } from "react-toastify"

// The API pages properties 20 at a time.
const PAGE_SIZE = 20

// The deployed API ignores ?status - it returns the whole catalogue for
// status=draft as readily as for status=published - so a Drafts tab would just
// list all 104 published properties again. The backend repo does implement the
// filter, so flip this to true once that build is deployed; everything behind
// it (tabs, counts, Draft chips) is already wired up.
const DRAFTS_ENABLED = false

const emptyFilter = () => ({
    name: null,
    region: null,
    location: null,
    page: 0
})

function Places ({
    initialStatus = 'published'
}) {

    const [ status, setStatus ] = useState(DRAFTS_ENABLED ? initialStatus : 'published')
    const [ placeData, setPlaceData ] = useState([])
    const [ filter, setFilter ] = useState(emptyFilter())
    const [ totalData, setTotalData ] = useState(0)
    const [ counts, setCounts ] = useState({ published: null, draft: null })
    const [ loading, setLoading ] = useState(true)
    const [ deleteDialog, setDeleteDialog ] = useState({ open: false, place: null })
    const [ hideDialog, setHideDialog ] = useState({ open: false, place: null })

    const navigate = useNavigate()
    const [ debounceFilter ] = useDebounce(filter, 500)

    useEffect(() => {
        setLoading(true)
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceFilter, status])

    useEffect(() => {
        loadCounts()
    }, [])

    const loadData = async () => {
        let { data, error } = await getProperties({
            name: filter.name ? filter.name : '',
            region: filter.region ? filter.region.value : '',
            location: filter.location ? filter.location.value : '',
            page: filter.page || 0,
            status
        })
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setPlaceData(data.data); setTotalData(data.totalData) }
    }

    // Unfiltered totals behind each tab, so the draft count keeps showing what
    // is waiting even while the list is filtered down.
    const loadCounts = async () => {
        if (!DRAFTS_ENABLED) { return }
        let [ published, draft ] = await Promise.all([
            getProperties({ page: 0, status: 'published' }),
            getProperties({ page: 0, status: 'draft' })
        ])
        setCounts({
            published: published.data ? published.data.totalData : null,
            draft: draft.data ? draft.data.totalData : null
        })
    }

    const afterMutation = async () => {
        await loadData()
        loadCounts()
    }

    const deleteProps = async (e)  => {
        setDeleteDialog({ open: false, place: null })
        let { data, error } = await deleteProperties(e)
        if (error) { toast.error(error) }
        if (data) { toast.success("Property deleted"); await afterMutation() }
    }

    const hideProps = async (e)  => {
        setHideDialog({ open: false, place: null })
        let { data, error } = await hideProperties(e)
        if (error) { toast.error(error) }
        if (data) { toast.success("Visibility updated"); await afterMutation() }
    }

    const onChangeFilter = (e) => {
        setFilter(prev => ({
            ...prev,
            ...e,
            page: 0
        }))
    }

    const onChangeStatus = (nextStatus) => {
        setStatus(nextStatus)
        setFilter(emptyFilter())
    }

    const placeOf = (place) => [place.location, place.region]
        .filter(Boolean)
        .map((value) => String(value))
        .join(', ')

    const statusChip = (place) => {
        if (place.status === 'draft') {
            return <Chip size="small" label="Draft" sx={{ bgcolor: 'warning.lighter', color: 'warning.main', fontWeight: 500 }} />
        }
        if (place.isActive === false) {
            return <Chip size="small" label="Hidden" sx={{ bgcolor: 'secondary.lighter', color: 'text.secondary', fontWeight: 500 }} />
        }
        return <Chip size="small" label="Live" sx={{ bgcolor: 'success.lighter', color: 'success.main', fontWeight: 500 }} />
    }

    const tabLabel = (label, count) => (count === null ? label : `${label} (${count})`)

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="h4">Places</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Every villa, resort and hotel in the catalogue, published or still being written.
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<PlusOutlined />}
                        onClick={() => { navigate('/places/add-place') }}
                    >
                        Add New Place
                    </Button>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard content={false}>
                    {
                        DRAFTS_ENABLED &&
                        <Tabs
                            value={status}
                            onChange={(event, value) => { onChangeStatus(value) }}
                            sx={{ px: 2.5, borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab label={tabLabel('Published', counts.published)} value="published" />
                            <Tab label={tabLabel('Drafts', counts.draft)} value="draft" />
                        </Tabs>
                    }

                    <Box sx={{ pt: 2 }}>
                        <PlacesFilter
                            filter={filter}
                            onChangeFilter={onChangeFilter}
                            onClear={() => { setFilter(emptyFilter()) }}
                        />
                    </Box>

                    {/* The table keeps its own scroll so narrow screens never widen the page. */}
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Property</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    loading &&
                                    [0, 1, 2, 3, 4].map(row => (
                                        <TableRow key={row}>
                                            <TableCell colSpan={5}><Skeleton height={34} /></TableCell>
                                        </TableRow>
                                    ))
                                }

                                {
                                    !loading && !placeData.length &&
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 5 }}>
                                                {
                                                    status === 'draft'
                                                        ? "No drafts. Anything saved with 'Save as Draft' waits here until you publish it."
                                                        : "No published places match this search."
                                                }
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    !loading && placeData.map(place => (
                                        <TableRow key={place._id} hover>
                                            <TableCell sx={{ maxWidth: 320 }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar
                                                        variant="rounded"
                                                        src={(place.propertyImage || [])[0] || undefined}
                                                        alt={place.name || 'Untitled'}
                                                        sx={{ width: 40, height: 40 }}
                                                    >
                                                        {(place.name || 'U').charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="subtitle2" sx={{ fontStyle: place.name ? 'normal' : 'italic' }}>
                                                        {place.name || 'Untitled'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="textSecondary">
                                                    {placeOf(place) || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {place.type || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{statusChip(place)}</TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="Edit property">
                                                        <IconButton size="small" color="primary" onClick={() => {
                                                            navigate(`/places/${place._id}`)
                                                        }}>
                                                            <EditOutlined />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {
                                                        place.status !== 'draft' &&
                                                        <Tooltip title={place.isActive ? "Hide from the public site" : "Show on the public site"}>
                                                            <IconButton size="small" color="warning" onClick={() => {
                                                                setHideDialog({ open: true, place })
                                                            }}>
                                                                {place.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                    <Tooltip title="Delete property">
                                                        <IconButton size="small" color="error" onClick={() => {
                                                            setDeleteDialog({ open: true, place })
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

                    <TablePagination
                        component="div"
                        count={totalData}
                        rowsPerPage={PAGE_SIZE}
                        rowsPerPageOptions={[PAGE_SIZE]}
                        page={filter.page}
                        onPageChange={(event, page) => {
                            setFilter(prev => ({ ...prev, page }))
                        }}
                    />
                </MainCard>
            </Grid>

            <Dialog
                open={deleteDialog.open || hideDialog.open}
                onClose={() => {
                    setDeleteDialog({ open: false, place: null })
                    setHideDialog({ open: false, place: null })
                }}
            >
                <Grid container p={2.5} spacing={2} sx={{ maxWidth: 440 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            {hideDialog.open
                                ? (hideDialog.place && hideDialog.place.isActive ? "Hide this property?" : "Show this property?")
                                : "Delete this property?"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {
                                hideDialog.open
                                    ? `"${hideDialog.place ? hideDialog.place.name : ''}" will ${hideDialog.place && hideDialog.place.isActive ? 'no longer appear' : 'appear again'} on the public site.`
                                    : `"${deleteDialog.place ? deleteDialog.place.name : ''}" will be removed along with its rooms and prices. This cannot be undone.`
                            }
                        </Typography>
                    </Grid>
                    <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                        <Grid item>
                            <Button color="secondary" variant="outlined" onClick={() => {
                                setDeleteDialog({ open: false, place: null })
                                setHideDialog({ open: false, place: null })
                            }}>Cancel</Button>
                        </Grid>
                        <Grid item>
                            {
                                hideDialog.open &&
                                <Button variant="contained" color="warning" onClick={() => {
                                    // was deleteProps - the Hide button was permanently
                                    // deleting the property instead of toggling isActive
                                    hideProps(hideDialog.place._id)
                                }}>
                                    {hideDialog.place && hideDialog.place.isActive ? "Hide" : "Show"}
                                </Button>
                            }
                            {
                                deleteDialog.open &&
                                <Button variant="contained" color="error" onClick={() => {
                                    deleteProps(deleteDialog.place._id)
                                }}>Delete</Button>
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default Places
