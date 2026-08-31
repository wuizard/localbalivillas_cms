import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    Grid,
    Link,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import moment from "moment";
import { useDebounce } from "use-debounce";

import MainCard from "components/MainCard";
import { currencyFormat } from "helper/numberHelper";
import { getActivityOrders, updateActivityOrderStatus } from "services/activityOrderService";
import ActivityOrderFilter from "./ActivityOrderFilter";
import { statusChipSx, statusMeta } from "./activityOrderStatus";

/**
 * What can be done to an order from the list, by the status it is in now — the same
 * shape the villa Orders screen uses. Every one of these moves money or a supplier
 * commitment, so each goes through a confirmation dialog rather than firing on click.
 */
const ACTIONS = {
    waiting_payment: [
        { to: 'paid', label: 'Mark paid', color: 'success' },
        { to: 'cancelled', label: 'Cancel', color: 'warning' },
    ],
    paid: [
        { to: 'confirmed', label: 'Confirm', color: 'success' },
        { to: 'refunded', label: 'Refund', color: 'error' },
    ],
    confirmed: [
        { to: 'refunded', label: 'Refund', color: 'error' },
    ],
};

const ACTION_COPY = {
    paid: {
        title: 'Mark this order as paid?',
        body: 'Use this when payment landed outside the Xendit link — a transfer, or cash. It does not charge anyone.',
        confirm: 'Mark paid',
    },
    confirmed: {
        title: 'Confirm this order?',
        body: 'Confirms the place with the supplier. The guest should already have paid.',
        confirm: 'Confirm',
    },
    cancelled: {
        title: 'Cancel this order?',
        body: 'The seats are released back to the date. Any money already taken is not refunded by this — do that in Xendit.',
        confirm: 'Cancel order',
    },
    refunded: {
        title: 'Mark this order as refunded?',
        body: 'Records that a refund was issued. The refund itself is a manual operation in Xendit — this does not move money.',
        confirm: 'Mark refunded',
    },
};

const defaultFilter = () => ({ search: '', status: null, date: null })

function ActivityOrders() {
    const navigate = useNavigate()

    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState(defaultFilter())
    const [dialog, setDialog] = useState({ open: false, order: null, action: null })

    // Typing in the search box should not fire a request per keystroke — same 500ms
    // the villa orders list uses.
    const [debouncedFilter] = useDebounce(filter, 500)

    const load = useCallback(async () => {
        setLoading(true)
        const { data, error } = await getActivityOrders({
            search: debouncedFilter.search || '',
            status: debouncedFilter.status ? debouncedFilter.status.value : '',
            date: debouncedFilter.date || '',
        })
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setRows(data.data || []) }
    }, [debouncedFilter])

    useEffect(() => { load() }, [load])

    const runAction = async (order, action) => {
        setDialog({ open: false, order: null, action: null })
        const { data, error } = await updateActivityOrderStatus({ _id: order._id, status: action.to })
        if (error) { toast.error(error); return }
        if (data) { toast.success(`Order ${statusMeta(action.to).label.toLowerCase()}`); load() }
    }

    const copy = dialog.action ? ACTION_COPY[dialog.action.to] : null
    const today = moment().format('YYYY-MM-DD')

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">Activity orders</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Soonest departure first &mdash; a trip leaving tomorrow needs confirming with
                        the supplier today.
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard>
                    <ActivityOrderFilter
                        filter={filter}
                        onChangeFilter={(patch) => setFilter((prev) => ({ ...prev, ...patch }))}
                        onClear={() => setFilter(defaultFilter())}
                    />
                </MainCard>
            </Grid>

            <Grid item xs={12}>
                <MainCard content={false}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order</TableCell>
                                    <TableCell>Guest</TableCell>
                                    <TableCell>Activity</TableCell>
                                    <TableCell>Departure</TableCell>
                                    <TableCell>Guests</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && [0, 1, 2].map((r) => (
                                    <TableRow key={r}>
                                        <TableCell colSpan={8}><Skeleton height={32} /></TableCell>
                                    </TableRow>
                                ))}

                                {!loading && rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 5 }}>
                                                No activity orders match these filters.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && rows.map((order) => {
                                    const meta = statusMeta(order.lastStatus)
                                    const pax = order.pax || {}
                                    const info = order.activityInfo || {}
                                    const guest = order.guestInfo || {}
                                    const actions = ACTIONS[order.lastStatus] || []
                                    const soon = order.date && order.date >= today &&
                                        moment(order.date).diff(moment(today), 'days') <= 3

                                    return (
                                        <TableRow key={order._id} hover>
                                            <TableCell>
                                                <Link
                                                    component="button"
                                                    variant="subtitle2"
                                                    underline="always"
                                                    onClick={() => navigate(`/activity-orders/${order._id}`)}
                                                >
                                                    {order.activityBookingId}
                                                </Link>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    {moment(order.createdDate).format('DD MMM YYYY HH:mm')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{guest.name || '-'}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {guest.email || ''}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 240 }}>
                                                <Stack sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" noWrap>{info.name || '-'}</Typography>
                                                    <Typography variant="caption" color="textSecondary" noWrap>
                                                        {info.region || ''}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="body2">
                                                        {order.date ? moment(order.date).format('DD MMM YYYY') : '-'}
                                                    </Typography>
                                                    {soon && <Chip size="small" color="error" label="Soon" />}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                {pax.adult || 0}A{pax.child ? ` + ${pax.child}C` : ''}
                                            </TableCell>
                                            <TableCell>{currencyFormat(order.totalPrice || 0)}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={meta.label} sx={statusChipSx(order.lastStatus)} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    {actions.map((action) => (
                                                        <Button
                                                            key={action.to}
                                                            size="small"
                                                            variant="outlined"
                                                            color={action.color}
                                                            onClick={() => setDialog({ open: true, order, action })}
                                                        >
                                                            {action.label}
                                                        </Button>
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                </MainCard>
            </Grid>

            <Dialog open={dialog.open} onClose={() => setDialog({ open: false, order: null, action: null })}>
                <Grid container p={2.5} spacing={2} sx={{ maxWidth: 440 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>{copy ? copy.title : ''}</Typography>
                        <Typography variant="body2" color="textSecondary">{copy ? copy.body : ''}</Typography>
                        {dialog.order && (
                            <Typography variant="body2" sx={{ mt: 1.5, fontFamily: 'monospace' }}>
                                {dialog.order.activityBookingId}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item container xs={12} justifyContent="flex-end" spacing={1}>
                        <Grid item>
                            <Button color="secondary" variant="outlined"
                                onClick={() => setDialog({ open: false, order: null, action: null })}>
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained"
                                color={dialog.action ? dialog.action.color : 'primary'}
                                onClick={() => runAction(dialog.order, dialog.action)}>
                                {copy ? copy.confirm : ''}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default ActivityOrders;
