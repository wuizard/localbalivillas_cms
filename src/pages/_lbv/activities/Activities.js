import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

import MainCard from "components/MainCard";
import CategoryFilter from "components/_lbvcomponents/CategoryFilter";
import { currencyFormat } from "helper/numberHelper";
import useCategories, { categoryLabel } from "helper/useCategories";
import { deleteActivity, getActivities, hideActivity } from "services/activityService";

function Activities({ status = 'published' }) {
    const navigate = useNavigate()
    const isDrafts = status === 'draft'

    const [ rows, setRows ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ deleteDialog, setDeleteDialog ] = useState({ open: false, activity: null })

    // Categories are managed in Settings, so both the chip filter and the label
    // in the table read the live list rather than a copy kept in this file.
    const { categories, loading: loadingCategories } = useCategories({ activeOnly: false })
    const [ category, setCategory ] = useState('')
    const [ search, setSearch ] = useState('')
    const [ debouncedSearch ] = useDebounce(search, 400)

    const loadActivities = useCallback(async () => {
        setLoading(true)
        let { data, error } = await getActivities({ status, category, name: debouncedSearch })
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setRows(data.data || []) }
    }, [status, category, debouncedSearch])

    useEffect(() => {
        loadActivities()
    }, [loadActivities])

    const removeActivity = async (_id) => {
        setDeleteDialog({ open: false, activity: null })
        let { data, error } = await deleteActivity({ _id })
        if (error) { toast.error(error) }
        if (data) { toast.success("Activity deleted"); loadActivities() }
    }

    const toggleVisibility = async (_id) => {
        let { data, error } = await hideActivity({ _id })
        if (error) { toast.error(error) }
        if (data) { loadActivities() }
    }

    // A published activity with no price is a public page that cannot say what it
    // costs, so the list flags it rather than waiting for someone to notice.
    const priceOf = (activity) => {
        const adult = activity.pricing && activity.pricing.adult
        if (!adult) { return <Chip size="small" color="warning" label="No price" /> }
        const suffix = activity.pricing.basis === 'per_group' ? '/group' : '/person'
        return `${currencyFormat(adult)} ${suffix}`
    }

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
                        <Typography variant="h4">{isDrafts ? 'Activity drafts' : 'Activities'}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {isDrafts
                                ? 'Work in progress. Drafts never appear on the public site.'
                                : 'Tours, transfers and experiences listed on the website.'}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => { navigate(isDrafts ? '/activities' : '/activities/drafts') }}
                        >
                            {isDrafts ? 'Published' : 'Drafts'}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PlusOutlined />}
                            onClick={() => { navigate('/activities/add-activity') }}
                        >
                            Add Activity
                        </Button>
                    </Stack>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard content={false}>
                    <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search activities by name"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value) }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlined style={{ fontSize: '0.9rem' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                    <CategoryFilter
                        categories={categories}
                        value={category}
                        onChange={setCategory}
                        loading={loadingCategories}
                    />
                    <Box sx={{ overflowX: 'auto' }}>
                        {/* nowrap keeps a row one line tall on a phone - the box above scrolls */}
                        <Table sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Region</TableCell>
                                    <TableCell>From</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    [0, 1, 2].map((row) => (
                                        <TableRow key={row}>
                                            <TableCell colSpan={6}><Skeleton height={32} /></TableCell>
                                        </TableRow>
                                    ))
                                ) : rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                                {isDrafts ? 'No drafts.' : 'No activities yet. Add one to get started.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : rows.map((activity) => (
                                    <TableRow key={activity._id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle1">{activity.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                /{activity.key}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{categoryLabel(categories, activity.category)}</TableCell>
                                        <TableCell>{activity.region || '-'}</TableCell>
                                        <TableCell>{priceOf(activity)}</TableCell>
                                        <TableCell>
                                            {activity.status === 'draft' ? (
                                                <Chip size="small" label="Draft" />
                                            ) : activity.isActive === false ? (
                                                <Chip size="small" color="default" label="Hidden" />
                                            ) : (
                                                <Chip size="small" color="success" label="Live" />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={activity.isActive === false ? 'Show on site' : 'Hide from site'}>
                                                <IconButton onClick={() => toggleVisibility(activity._id)}>
                                                    {activity.isActive === false ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton onClick={() => navigate(`/activities/${activity._id}`)}>
                                                    <EditOutlined />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => setDeleteDialog({ open: true, activity })}
                                                >
                                                    <DeleteOutlined />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </MainCard>
            </Grid>

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, activity: null })}
            >
                <Box sx={{ p: 3, maxWidth: 420 }}>
                    <Typography variant="h5">Delete this activity?</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        &ldquo;{deleteDialog.activity && deleteDialog.activity.name}&rdquo; will be
                        removed from the website. Any enquiries about it stay readable.
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button onClick={() => setDeleteDialog({ open: false, activity: null })}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => removeActivity(deleteDialog.activity._id)}
                        >
                            Delete
                        </Button>
                    </Stack>
                </Box>
            </Dialog>
        </Grid>
    )
}

export default Activities;
