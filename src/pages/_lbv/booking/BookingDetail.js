import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel";
import { currencyFormat } from "helper/numberHelper";
import { getBooking } from "services/bookingService";

// Matches the vocabulary the Orders list already uses, plus the states a booking can
// reach after it. Kept here rather than imported so this screen renders every status
// the API can return, not only the two the list filters on.
const STATUS_META = {
    waiting_confirmation: { label: 'Waiting confirmation', color: 'warning' },
    confirmed: { label: 'Confirmed', color: 'success' },
    checkout: { label: 'Checked out', color: 'default' },
    paid: { label: 'Paid', color: 'info' },
    refund: { label: 'Refunded', color: 'error' },
};

const statusMeta = (value) => STATUS_META[value] || { label: value || '—', color: 'default' };

function Row({ label, children }) {
    if (children === null || children === undefined || children === '') { return null }
    return (
        <Grid container spacing={1} sx={{ py: 0.75 }}>
            <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">{label}</Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
                <Typography variant="body2">{children}</Typography>
            </Grid>
        </Grid>
    )
}

function BookingDetail() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [bookingData, setBookingData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        // The id comes from the route rather than being sliced off
        // window.location.pathname, which broke on any trailing slash.
        const { data, error: loadError } = await getBooking(id)
        setLoading(false)
        // Deliberately not logging `data`. It is the full booking payload - guest
        // name, email, phone - and it was being printed to the browser console.
        if (loadError) { setError(loadError); return }
        if (data) { setBookingData(data) }
    }, [id])

    useEffect(() => { load() }, [load])

    if (loading) {
        return <Card sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Card>
    }

    if (error || !bookingData) {
        return (
            <Card sx={{ p: 3 }}>
                <Typography variant="h5">Booking not found</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {error || 'This booking may have been removed.'}
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/order')}>
                    Back to orders
                </Button>
            </Card>
        )
    }

    const guest = bookingData.guestInfo || {}
    const place = bookingData.propertiesInfo || {}
    const dates = bookingData.dates || []
    const voucher = bookingData.voucherInfo
    const meta = statusMeta(bookingData.lastStatus)

    const checkIn = dates[0]
    const checkOut = dates[dates.length - 1]
    // `dates` is inclusive of the checkout day, so nights are one fewer - the same
    // rule the pricing code follows.
    const nights = Math.max(dates.length - 1, 0)

    const waPhone = String(guest.phoneNumber || '').replace(/[^0-9]/g, '')
    const cover = (place.placeImage || [])[0]

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1.5}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                            {bookingData.bookingId}
                        </Typography>
                        <Chip size="small" color={meta.color} label={meta.label} />
                    </Stack>
                    <Button variant="outlined" onClick={() => navigate('/order')}>
                        Back to orders
                    </Button>
                </Stack>
            </Grid>

            {bookingData.lastStatus === 'waiting_confirmation' && (
                <Grid item xs={12}>
                    <Alert severity="warning">
                        Not confirmed yet. The guest has booked but nobody has accepted this
                        reservation &mdash; confirm or reject it from the Orders list.
                    </Alert>
                </Grid>
            )}

            <Grid item xs={12} md={7}>
                <Card sx={{ p: 3 }}>
                    <LBVTitleLabel>The stay</LBVTitleLabel>
                    <Divider sx={{ my: 1.5 }} />

                    <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                        {cover && (
                            <img
                                src={cover}
                                alt={place.propertiesName || 'Property'}
                                width={120}
                                height={90}
                                style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                            />
                        )}
                        <div>
                            <Typography variant="h5">{place.roomName}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {place.propertiesName}
                            </Typography>
                        </div>
                    </Stack>

                    <Row label="Check in">
                        {checkIn ? moment(checkIn).format('dddd, D MMMM YYYY') : null}
                    </Row>
                    <Row label="Check out">
                        {checkOut ? moment(checkOut).format('dddd, D MMMM YYYY') : null}
                    </Row>
                    <Row label="Nights">{nights ? `${nights} night${nights === 1 ? '' : 's'}` : null}</Row>
                    <Row label="Rooms">{bookingData.totalRooms}</Row>
                    <Row label="Guests">
                        {`${guest.adult || 0} adult${(guest.adult || 0) === 1 ? '' : 's'}`}
                        {guest.kids ? `, ${guest.kids} child${guest.kids === 1 ? '' : 'ren'}` : ''}
                        {guest.kids > 0 && guest.childrenAge ? ` (age ${guest.childrenAge})` : ''}
                    </Row>
                    <Row label="Arrival time">{bookingData.arrivalTime}</Row>
                    <Row label="Booked">
                        {bookingData.createdDate ? moment(bookingData.createdDate).format('D MMM YYYY, HH:mm') : null}
                    </Row>

                    {bookingData.specialRequest ? (
                        <>
                            <Divider sx={{ my: 1.5 }} />
                            <LBVLabel style={{ fontSize: 12, color: '#858585' }}>Special request</LBVLabel>
                            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                {bookingData.specialRequest}
                            </Typography>
                        </>
                    ) : null}
                </Card>

                <Card sx={{ p: 3, mt: 2 }}>
                    <LBVTitleLabel>What was charged</LBVTitleLabel>
                    <Divider sx={{ my: 1.5 }} />

                    <Row label="Subtotal">{currencyFormat(bookingData.subtotal || 0)}</Row>

                    {voucher && voucher.voucherCode ? (
                        <Row label="Promo">
                            {`${voucher.voucherCode} − `}
                            {voucher.discountType === 'nominal'
                                ? currencyFormat(voucher.nominal || 0)
                                : `${voucher.nominal || 0}%`}
                            {voucher.couponUsage === 'night' ? ' per night' : ''}
                        </Row>
                    ) : null}

                    <Divider sx={{ my: 1 }} />
                    <Grid container sx={{ py: 0.75 }}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="textSecondary">Total</Typography>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Typography variant="h5">
                                {currencyFormat(bookingData.totalPrice || 0)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ mt: 1.5 }}>
                        Villa bookings are non-refundable. A refund is a manual operation in Xendit.
                    </Alert>
                </Card>
            </Grid>

            <Grid item xs={12} md={5}>
                <Card sx={{ p: 3 }}>
                    <LBVTitleLabel>Guest</LBVTitleLabel>
                    <Divider sx={{ my: 1.5 }} />
                    <Row label="Name">{guest.name}</Row>
                    <Row label="Email">{guest.email}</Row>
                    <Row label="Phone">{guest.phoneNumber}</Row>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        {waPhone && (
                            <Button variant="contained" color="success" size="small"
                                href={`https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(`Hi ${guest.firstName || ''}, about your booking ${bookingData.bookingId} —`)}`}
                                target="_blank" rel="noopener noreferrer">
                                WhatsApp
                            </Button>
                        )}
                        {guest.email && (
                            <Button variant="outlined" size="small"
                                href={`mailto:${guest.email}?subject=Your booking ${bookingData.bookingId}`}>
                                Email
                            </Button>
                        )}
                    </Stack>
                </Card>

                {bookingData.paymentLink && (
                    <Card sx={{ p: 3, mt: 2 }}>
                        <LBVTitleLabel>Payment</LBVTitleLabel>
                        <Divider sx={{ my: 1.5 }} />
                        <Button variant="outlined" fullWidth
                            href={bookingData.paymentLink} target="_blank" rel="noopener noreferrer">
                            Open payment link
                        </Button>
                    </Card>
                )}

                <Card sx={{ p: 3, mt: 2 }}>
                    <LBVTitleLabel>Timeline</LBVTitleLabel>
                    <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                        Every state this booking has passed through.
                    </LBVLabel>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack spacing={0.75}>
                        {(bookingData.status || []).map((entry) => (
                            <Stack key={entry.status} direction="row" justifyContent="space-between">
                                <Typography
                                    variant="body2"
                                    color={entry.date ? 'textPrimary' : 'textSecondary'}
                                >
                                    {statusMeta(entry.status).label}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {entry.date ? moment(entry.date).format('D MMM, HH:mm') : '—'}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Card>
            </Grid>
        </Grid>
    )
}

export default BookingDetail
