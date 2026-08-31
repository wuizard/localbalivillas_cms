import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Link,
    Stack,
    Typography
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";

import { LBVSelect } from "components/_lbvcomponents/LBVInput";
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel";
import { currencyFormat } from "helper/numberHelper";
import { getActivityOrder, updateActivityOrderStatus } from "services/activityOrderService";
import { ORDER_STATUS, statusChipSx, statusMeta } from "./activityOrderStatus";

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

function ActivityOrderDetail() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        const { data, error } = await getActivityOrder(id)
        setLoading(false)
        if (error) { toast.error(error); return }
        if (!data) { return }
        setOrder(data)
        setStatus(ORDER_STATUS.find((s) => s.value === data.lastStatus) || ORDER_STATUS[0])
    }, [id])

    useEffect(() => { load() }, [load])

    const save = async () => {
        setSaving(true)
        const { data, error } = await updateActivityOrderStatus({ _id: id, status: status.value })
        setSaving(false)
        if (error) { toast.error(error); return }
        if (data) { toast.success('Order updated'); setOrder(data) }
    }

    if (loading) {
        return <Card sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Card>
    }
    if (!order) {
        return <Card sx={{ p: 4 }}><Typography>Order not found.</Typography></Card>
    }

    const guest = order.guestInfo || {}
    const info = order.activityInfo || {}
    const pax = order.pax || {}
    const price = (order.priceDetails || [])[0] || {}
    const meta = statusMeta(order.lastStatus)
    const paid = ['paid', 'confirmed'].indexOf(order.lastStatus) >= 0

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
                            {order.activityBookingId}
                        </Typography>
                        <Chip size="small" label={meta.label} sx={statusChipSx(order.lastStatus)} />
                    </Stack>
                    <Button variant="outlined" onClick={() => navigate('/activity-orders')}>
                        Back to orders
                    </Button>
                </Stack>
            </Grid>

            {!paid && order.paymentLink && (
                <Grid item xs={12}>
                    <Alert severity="warning">
                        This order has not been paid. The guest&rsquo;s payment link is{' '}
                        <Link href={order.paymentLink} target="_blank" rel="noopener noreferrer">
                            still open
                        </Link>
                        {' '}&mdash; nothing is confirmed with the supplier until it is settled.
                    </Alert>
                </Grid>
            )}

            <Grid item xs={12} md={7}>
                <Card sx={{ p: 3 }}>
                    <LBVTitleLabel>The booking</LBVTitleLabel>
                    <Divider sx={{ my: 1.5 }} />
                    <Row label="Activity">{info.name}</Row>
                    <Row label="Date">{order.date ? moment(order.date).format('dddd, D MMMM YYYY') : null}</Row>
                    <Row label="Guests">
                        {`${pax.adult || 0} adult${(pax.adult || 0) === 1 ? '' : 's'}`}
                        {pax.child ? `, ${pax.child} child${pax.child === 1 ? '' : 'ren'}` : ''}
                    </Row>
                    <Row label="Meeting point">{info.meetingPoint}</Row>
                    <Row label="Pick-up area">{order.pickupArea}</Row>
                    <Row label="Region">{info.region}</Row>
                    <Row label="Booked">{moment(order.createdDate).format('D MMM YYYY, HH:mm')}</Row>

                    {order.specialRequest ? (
                        <>
                            <Divider sx={{ my: 1.5 }} />
                            <LBVLabel style={{ fontSize: 12, color: '#858585' }}>Special request</LBVLabel>
                            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                {order.specialRequest}
                            </Typography>
                        </>
                    ) : null}
                </Card>

                <Card sx={{ p: 3, mt: 2 }}>
                    <LBVTitleLabel>What was charged</LBVTitleLabel>
                    <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                        The rates as they were when the guest paid. A later price change does not
                        alter this.
                    </LBVLabel>
                    <Divider sx={{ my: 1.5 }} />
                    <Row label="Adult rate">
                        {price.adultRate ? `${currencyFormat(price.adultRate)} × ${price.chargedAdults || 0}` : null}
                    </Row>
                    <Row label="Child rate">
                        {price.childRate && price.child ? `${currencyFormat(price.childRate)} × ${price.child}` : null}
                    </Row>
                    {price.minimumApplied && (
                        <Alert severity="info" sx={{ my: 1 }}>
                            Billed at the activity&rsquo;s minimum party size, so the guest paid for more
                            places than people attending.
                        </Alert>
                    )}
                    <Row label="Subtotal">{currencyFormat(order.subtotal || 0)}</Row>
                    {order.voucherInfo && order.voucherInfo.voucherCode ? (
                        <Row label="Promo">
                            {`${order.voucherInfo.voucherCode} − ${currencyFormat(order.voucherInfo.nominal || 0)}`}
                        </Row>
                    ) : null}
                    <Divider sx={{ my: 1 }} />
                    <Grid container sx={{ py: 0.75 }}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="textSecondary">Total</Typography>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Typography variant="h5">{currencyFormat(order.totalPrice || 0)}</Typography>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>

            <Grid item xs={12} md={5}>
                <Card sx={{ p: 3 }}>
                    <LBVTitleLabel>Guest</LBVTitleLabel>
                    <Divider sx={{ my: 1.5 }} />
                    <Row label="Name">{guest.name}</Row>
                    <Row label="Email">{guest.email}</Row>
                    <Row label="Phone">{guest.phoneNumber}</Row>
                    <Row label="Country">{guest.country}</Row>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        {guest.phoneNumber && (
                            <Button variant="contained" color="success" size="small"
                                href={`https://api.whatsapp.com/send?phone=${String(guest.phoneNumber).replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hi ${guest.firstName || ''}, about your booking ${order.activityBookingId} —`)}`}
                                target="_blank" rel="noopener noreferrer">
                                WhatsApp
                            </Button>
                        )}
                        {guest.email && (
                            <Button variant="outlined" size="small"
                                href={`mailto:${guest.email}?subject=Your booking ${order.activityBookingId}`}>
                                Email
                            </Button>
                        )}
                    </Stack>
                </Card>

                <Card sx={{ p: 3, mt: 2 }}>
                    <LBVTitleLabel>Status</LBVTitleLabel>
                    <Divider sx={{ my: 1.5 }} />
                    <LBVSelect label="Set status" options={ORDER_STATUS}
                        value={status} onChange={(e) => setStatus(e)} />
                    <Button variant="contained" fullWidth sx={{ mt: 2 }}
                        disabled={saving} onClick={save}>
                        {saving ? <CircularProgress size={22} style={{ color: 'white' }} /> : 'Save status'}
                    </Button>

                    <Divider sx={{ my: 2 }} />
                    <LBVLabel style={{ fontSize: 12, color: '#858585' }}>Timeline</LBVLabel>
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                        {(order.status || []).map((entry) => (
                            <Stack key={entry.status} direction="row" justifyContent="space-between">
                                <Typography variant="body2"
                                    color={entry.date ? 'textPrimary' : 'textSecondary'}>
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

export default ActivityOrderDetail;
