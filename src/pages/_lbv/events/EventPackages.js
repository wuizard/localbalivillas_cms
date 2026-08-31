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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import MainCard from "components/MainCard";
import { currencyFormat } from "helper/numberHelper";
import { deleteEventPackage, getEventPackages } from "services/eventService";

function EventPackages() {
    const navigate = useNavigate()

    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteDialog, setDeleteDialog] = useState({ open: false, pkg: null })

    const load = useCallback(async () => {
        setLoading(true)
        const { data, error } = await getEventPackages({})
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setRows(data.data || []) }
    }, [])

    useEffect(() => { load() }, [load])

    const remove = async (_id) => {
        setDeleteDialog({ open: false, pkg: null })
        const { data, error } = await deleteEventPackage({ _id })
        if (error) { toast.error(error) }
        if (data) { toast.success('Occasion deleted'); load() }
    }

    const rangeOf = (pkg) => {
        if (!pkg.indicativeFrom) { return <Chip size="small" label="No range" /> }
        return pkg.indicativeTo
            ? `${currencyFormat(pkg.indicativeFrom)} – ${currencyFormat(pkg.indicativeTo)}`
            : `from ${currencyFormat(pkg.indicativeFrom)}`
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
                        <Typography variant="h4">Occasions</Typography>
                        <Typography variant="body2" color="textSecondary">
                            The event types listed on the website. Ranges are indicative &mdash;
                            the quote comes out of the conversation.
                        </Typography>
                    </Stack>
                    <Button variant="contained" startIcon={<PlusOutlined />}
                        onClick={() => navigate('/events/add-occasion')}>
                        Add Occasion
                    </Button>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard content={false}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Guests</TableCell>
                                    <TableCell>Typically</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    [0, 1, 2].map((row) => (
                                        <TableRow key={row}>
                                            <TableCell colSpan={5}><Skeleton height={32} /></TableCell>
                                        </TableRow>
                                    ))
                                ) : rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                                No occasions yet.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : rows.map((pkg) => (
                                    <TableRow key={pkg._id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle1">{pkg.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                /{pkg.key}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {pkg.suitableGuestsMin && pkg.suitableGuestsMax
                                                ? `${pkg.suitableGuestsMin}–${pkg.suitableGuestsMax}`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>{rangeOf(pkg)}</TableCell>
                                        <TableCell>
                                            {pkg.status === 'draft'
                                                ? <Chip size="small" label="Draft" />
                                                : <Chip size="small" color="success" label="Live" />}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton onClick={() => navigate(`/events/${pkg._id}`)}>
                                                    <EditOutlined />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error"
                                                    onClick={() => setDeleteDialog({ open: true, pkg })}>
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

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, pkg: null })}>
                <Box sx={{ p: 3, maxWidth: 420 }}>
                    <Typography variant="h5">Delete this occasion?</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        &ldquo;{deleteDialog.pkg && deleteDialog.pkg.name}&rdquo; will be removed from
                        the website. Enquiries that referenced it stay readable.
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button onClick={() => setDeleteDialog({ open: false, pkg: null })}>Cancel</Button>
                        <Button variant="contained" color="error"
                            onClick={() => remove(deleteDialog.pkg._id)}>
                            Delete
                        </Button>
                    </Stack>
                </Box>
            </Dialog>
        </Grid>
    )
}

export default EventPackages;
