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
import { toast } from "react-toastify";
import moment from "moment";

import { LBVInput, LBVSelect } from "components/_lbvcomponents/LBVInput";
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel";
import { currencyFormat } from "helper/numberHelper";
import { getEnquiry, updateEnquiryStatus } from "services/enquiryService";
import { SOURCE_LABEL, STATUS_OPTIONS, statusMeta } from "./Enquiries";

const BUDGET_LABEL = {
    under_25m: 'Under IDR 25,000,000',
    '25m_50m': 'IDR 25 – 50,000,000',
    '50m_100m': 'IDR 50 – 100,000,000',
    over_100m: 'Over IDR 100,000,000',
    not_sure: 'Not sure yet',
};

function Row({ label, children }) {
    if (!children) { return null }
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

function EnquiryDetail() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [enquiry, setEnquiry] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState(null)
    const [quoteAmount, setQuoteAmount] = useState('')
    const [internalNote, setInternalNote] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        const { data, error } = await getEnquiry(id)
        setLoading(false)
        if (error) { toast.error(error); return }
        if (!data) { return }
        setEnquiry(data)
        setStatus(STATUS_OPTIONS.find((option) => option.value === data.lastStatus) || STATUS_OPTIONS[0])
        setQuoteAmount((data.quote || {}).amount || '')
        setInternalNote(data.internalNote || '')
    }, [id])

    useEffect(() => { load() }, [load])

    const save = async () => {
        setSaving(true)
        const { data, error } = await updateEnquiryStatus({
            _id: id,
            status: status ? status.value : undefined,
            quoteAmount: quoteAmount === '' ? undefined : quoteAmount,
            internalNote,
        })
        setSaving(false)
        if (error) { toast.error(error); return }
        if (data) { toast.success('Enquiry updated'); setEnquiry(data) }
    }

    if (loading) {
        return <Card sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Card>
    }

    if (!enquiry) {
        return <Card sx={{ p: 4 }}><Typography>Enquiry not found.</Typography></Card>
    }

    const guest = enquiry.guest || {}
    const meta = statusMeta(enquiry.lastStatus)

    // The message the guest was handed. Reusing it means the team opens the same
    // thread rather than starting a second one.
    const waNumber = String(guest.phoneNumber || '').replace(/[^0-9]/g, '')
    const waText = encodeURIComponent(`Hi ${guest.firstName || ''}, about your enquiry ${enquiry.reference} —`)

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>{enquiry.reference}</Typography>
                        <Chip size="small" color={meta.color} label={meta.label} />
                    </Stack>
                    <Button variant="outlined" onClick={() => navigate('/enquiries')}>Back</Button>
                </Stack>
            </Grid>

            {enquiry.handoff && enquiry.handoff.clickedAt ? (
                <Grid item xs={12}>
                    <Alert severity="info">
                        Opened WhatsApp {moment(enquiry.handoff.clickedAt).fromNow()}. That is a click,
                        not a sent message &mdash; if there is no thread, they never sent it.
                    </Alert>
                </Grid>
            ) : null}

            <Grid item xs={12} md={7}>
                <Card sx={{ p: 3 }}>
                    <LBVTitleLabel>What they asked for</LBVTitleLabel>
                    <Divider sx={{ my: 1.5 }} />
                    <Row label="Occasion">{(enquiry.subject || {}).name}</Row>
                    <Row label="Date">
                        {enquiry.eventDate
                            ? moment(enquiry.eventDate).format('dddd, D MMMM YYYY') + (enquiry.dateFlexible ? ' (flexible)' : '')
                            : (enquiry.dateFlexible ? 'Flexible' : null)}
                    </Row>
                    <Row label="Guests">{enquiry.guestCount}</Row>
                    <Row label="Villa">{enquiry.propertyName}</Row>
                    <Row label="Budget">{BUDGET_LABEL[enquiry.budgetBand]}</Row>
                    <Row label="Booking">{enquiry.bookingId}</Row>
                    <Row label="Source">{SOURCE_LABEL[enquiry.source] || enquiry.source}</Row>
                    <Row label="Received">{moment(enquiry.createdDate).format('D MMM YYYY, HH:mm')}</Row>

                    {enquiry.occasionNote ? (
                        <>
                            <Divider sx={{ my: 1.5 }} />
                            <LBVLabel style={{ fontSize: 12, color: '#858585' }}>In their words</LBVLabel>
                            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                {enquiry.occasionNote}
                            </Typography>
                        </>
                    ) : null}
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
                        {waNumber ? (
                            <Button variant="contained" color="success" size="small"
                                href={`https://api.whatsapp.com/send?phone=${waNumber}&text=${waText}`}
                                target="_blank" rel="noopener noreferrer">
                                WhatsApp
                            </Button>
                        ) : null}
                        {guest.email ? (
                            <Button variant="outlined" size="small"
                                href={`mailto:${guest.email}?subject=Your enquiry ${enquiry.reference}`}>
                                Email
                            </Button>
                        ) : null}
                    </Stack>
                </Card>

                <Card sx={{ p: 3, mt: 2 }}>
                    <LBVTitleLabel>Record the outcome</LBVTitleLabel>
                    <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                        Quoting still happens in the conversation. This is the record of it.
                    </LBVLabel>
                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <LBVSelect label="Status" options={STATUS_OPTIONS}
                                value={status} onChange={(e) => setStatus(e)} />
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput label="Quoted (IDR)" type="number"
                                value={quoteAmount}
                                onChange={(e) => setQuoteAmount(e.currentTarget.value)} />
                            {(enquiry.quote || {}).sentAt ? (
                                <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                                    Last quoted {currencyFormat(enquiry.quote.amount)} on{' '}
                                    {moment(enquiry.quote.sentAt).format('D MMM YYYY')}
                                </LBVLabel>
                            ) : null}
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput label="Internal note" type="textarea" rows={3}
                                value={internalNote}
                                onChange={(e) => setInternalNote(e.currentTarget.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" fullWidth disabled={saving} onClick={save}>
                                {saving ? <CircularProgress size={22} style={{ color: 'white' }} /> : 'Save'}
                            </Button>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    )
}

export default EnquiryDetail;
