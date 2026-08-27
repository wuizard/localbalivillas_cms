import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

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
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import moment from "moment";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

import MainCard from "components/MainCard";
import BookingFilter from "./BookingFilter";
import { checkOutBooking, confirmBooking, getBookings, refundBooking, rejectBooking } from "services/bookingService";
import { currencyFormat } from "helper/numberHelper";
import { statusChipSx, statusMeta } from "helper/bookingStatus";

// The orders endpoint returns the whole history in one response, so the list is
// paged here rather than asking the API for a page it would ignore.
const PAGE_SIZE = 10

const defaultFilter = () => ({
    bookingDateType: { label: '<>', value: 'ib'},
    bookingStartDate: null,
    bookingEndDate: null,
    checkinDateType: { label: '<>', value: 'ib'},
    checkinStartDate: null,
    checkinEndDate: null,
    checkoutDateType: { label: '<>', value: 'ib'},
    checkoutStartDate: null,
    checkoutEndDate: null,
    checkinDate: null,
    checkoutDate: null,
    bookingId: "",
    user: null,
    status: [
        { value: "waiting_confirmation", label: "Waiting Confirmation"},
        { value: "confirmed", label: "Confirmed"},
    ],
    page: 0
})

// What can be done to a booking, by the status it is in now.
const ACTIONS = {
    waiting_confirmation: [
        { type: 'confirmation', label: 'Confirm', color: 'success' },
        { type: 'reject', label: 'Reject', color: 'warning' },
        { type: 'refund', label: 'Refund', color: 'error' }
    ],
    confirmed: [
        { type: 'checkout', label: 'Check Out', color: 'primary' }
    ]
}

function Booking () {

    const [ loading, setLoading ] = useState(true)
    const [ bookingData, setBookingData ] = useState([])
    const [ page, setPage ] = useState(0)
    const [ filter, setFilter ] = useState(defaultFilter())

    const [ openDialog, setOpenDialog ] = useState({
        data: null,
        open: false
    })

    const navigate = useNavigate()
    const [ debounceFilter ] = useDebounce(filter, 500)

    useEffect(() => {
        loadBookings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceFilter])

    const loadBookings = async () => {
        setLoading(true)
        let { data, error } = await getBookings({
            ...filter,
            user: filter.user ? filter.user.value : '',
            status: filter.status ? filter.status.map(v => {return v.value}) : '',
        });
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setBookingData(data); setPage(0) }
    }

    const runAction = async (type, id) => {
        const services = {
            confirmation: confirmBooking,
            reject: rejectBooking,
            refund: refundBooking,
            checkout: checkOutBooking
        }
        const messages = {
            confirmation: "Booking confirmed",
            reject: "Booking rejected",
            refund: "Booking refunded",
            checkout: "Booking checked out"
        }

        let { data, error } = await services[type]({ id })
        if (error) { toast.error(error) }
        if (data) {
            toast.success(messages[type])
            setOpenDialog({ data: null, open: false })
            loadBookings()
        }
    }

    const onChangeFilter = (e) => {
        setFilter(prev => ({
            ...prev,
            ...e
        }))
    }

    const visibleBookings = useMemo(
        () => bookingData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
        [bookingData, page]
    )

    const nightsOf = (booking) => (booking.dates ? booking.dates.length : 0)

    const dialogCopy = () => {
        if (!openDialog.data) { return { title: '', body: '', confirm: '', color: 'primary' } }
        const type = openDialog.data.type
        if (type === 'checkout') {
            return {
                title: "Check this booking out?",
                body: "Please make sure the guest has already checked out.",
                confirm: "Check Out",
                color: 'primary'
            }
        }
        if (type === 'confirmation') {
            return {
                title: "Confirm this booking?",
                body: "A confirmation email will be sent to the guest.",
                confirm: "Confirm",
                color: 'success'
            }
        }
        if (type === 'refund') {
            return {
                title: "Refund this booking?",
                body: "A cancellation email will be sent to the guest.",
                confirm: "Refund",
                color: 'error'
            }
        }
        return {
            title: "Reject this booking?",
            body: "The guest will lose this reservation.",
            confirm: "Reject",
            color: 'warning'
        }
    }

    const copy = dialogCopy()

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">Orders</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Every reservation, from the ones waiting on you to the ones already checked out.
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard
                    title="Bookings"
                    content={false}
                    secondary={
                        <Typography variant="caption" color="textSecondary">
                            {loading ? 'Loading...' : `${bookingData.length} booking${bookingData.length === 1 ? '' : 's'}`}
                        </Typography>
                    }
                >
                    <BookingFilter
                        filter={filter}
                        onChangeFilter={onChangeFilter}
                        onClear={() => {
                            setFilter({ ...defaultFilter(), status: null })
                        }}
                    />

                    {/* The table keeps its own scroll so narrow screens never widen the page. */}
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Booking</TableCell>
                                    <TableCell>Guest</TableCell>
                                    <TableCell>Property / Room</TableCell>
                                    <TableCell>Stay</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    loading &&
                                    [0, 1, 2, 3, 4].map(row => (
                                        <TableRow key={row}>
                                            <TableCell colSpan={7}><Skeleton height={34} /></TableCell>
                                        </TableRow>
                                    ))
                                }

                                {
                                    !loading && !bookingData.length &&
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 5 }}>
                                                No bookings match these filters.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    !loading && visibleBookings.map(booking => {
                                        const dates = booking.dates || []
                                        const info = booking.propertiesInfo || {}
                                        const user = booking.user || {}
                                        const actions = ACTIONS[booking.lastStatus] || []

                                        return (
                                            <TableRow key={booking._id} hover>
                                                <TableCell>
                                                    <Link
                                                        component="button"
                                                        variant="subtitle2"
                                                        underline="always"
                                                        onClick={() => { navigate(`/order/${booking._id}`) }}
                                                    >
                                                        {booking.bookingId}
                                                    </Link>
                                                    <Typography variant="caption" color="textSecondary" display="block">
                                                        {moment(booking.createdDate).format('DD MMM YYYY HH:mm')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{user.name || '-'}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{user.email || ''}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 260 }}>
                                                    <Stack sx={{ minWidth: 0 }}>
                                                        <Typography variant="body2" noWrap>{info.propertiesName || '-'}</Typography>
                                                        <Typography variant="caption" color="textSecondary" noWrap>{info.roomName || ''}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {dates.length
                                                            ? `${moment(dates[0]).format('DD MMM')} - ${moment(dates[dates.length - 1]).format('DD MMM YYYY')}`
                                                            : '-'}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {`${nightsOf(booking)} night${nightsOf(booking) === 1 ? '' : 's'}`}
                                                        {booking.arrivalTime ? ` - arrives ${booking.arrivalTime}` : ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{currencyFormat(booking.totalPrice)}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip size="small" label={statusMeta(booking.lastStatus).label} sx={statusChipSx(booking.lastStatus)} />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                        {
                                                            actions.map(action => (
                                                                <Button
                                                                    key={action.type}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color={action.color}
                                                                    onClick={() => {
                                                                        setOpenDialog({
                                                                            data: { type: action.type, _id: booking._id },
                                                                            open: true
                                                                        })
                                                                    }}
                                                                >
                                                                    {action.label}
                                                                </Button>
                                                            ))
                                                        }
                                                        {
                                                            !actions.length &&
                                                            <Typography variant="caption" color="textSecondary">No action needed</Typography>
                                                        }
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </Box>

                    <TablePagination
                        component="div"
                        count={bookingData.length}
                        rowsPerPage={PAGE_SIZE}
                        rowsPerPageOptions={[PAGE_SIZE]}
                        page={page}
                        onPageChange={(event, nextPage) => { setPage(nextPage) }}
                    />
                </MainCard>
            </Grid>

            <Dialog open={openDialog.open} onClose={() => { setOpenDialog({ data: null, open: false }) }}>
                <Grid container p={2.5} spacing={2} sx={{ maxWidth: 440 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>{copy.title}</Typography>
                        <Typography variant="body2" color="textSecondary">{copy.body}</Typography>
                    </Grid>
                    <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                        <Grid item>
                            <Button color="secondary" variant="outlined" onClick={() => {
                                setOpenDialog({ data: null, open: false })
                            }}>Cancel</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color={copy.color} onClick={() => {
                                if (openDialog.data) { runAction(openDialog.data.type, openDialog.data._id) }
                            }}>{copy.confirm}</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default Booking
