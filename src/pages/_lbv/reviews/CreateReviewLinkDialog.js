import React, { useState } from "react";
import {
    Alert,
    Button,
    Dialog,
    Grid,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { toast } from "react-toastify";
import moment from "moment";

import { createReviewLink } from "services/reviewService";
import { ReviewLinkBox } from "./ReviewLinkPanel";

const stayDates = (dates) => {
    if (!dates || !dates.length) { return '' }
    const first = moment(dates[0]).format('D MMM YYYY')
    if (dates.length === 1) { return first }
    return `${first} – ${moment(dates[dates.length - 1]).format('D MMM YYYY')}`
}

/**
 * Generate a review link from a booking reference. The booking screen has its own
 * panel; this is for the common case of working from a booking ID in a WhatsApp
 * thread without hunting for the order first.
 */
function CreateReviewLinkDialog({ open, onClose }) {
    const [bookingId, setBookingId] = useState('')
    const [link, setLink] = useState(null)
    const [error, setError] = useState(null)
    const [working, setWorking] = useState(false)

    const close = () => {
        setBookingId('')
        setLink(null)
        setError(null)
        onClose()
    }

    const generate = async (event) => {
        if (event) { event.preventDefault() }
        const value = bookingId.trim()
        if (!value) { setError('Enter a booking ID'); return }

        setWorking(true)
        setError(null)
        const { data, error: failure } = await createReviewLink(value)
        setWorking(false)

        if (failure) { setError(failure); return }
        if (data) { setLink(data); toast.success("Review link ready") }
    }

    return (
        <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
            {/* A real form, so Enter submits. TextField's onKeyDown lands on the wrapper
                rather than the input, which made the key do nothing at all. */}
            <Grid container component="form" onSubmit={generate} p={2.5} spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h5">Create a review link</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        The guest reviews the place they stayed at on this booking. They will not be
                        asked for the email it was booked with.
                    </Typography>
                </Grid>

                {!link && (
                    <>
                        <Grid item xs={12}>
                            <TextField
                                autoFocus
                                fullWidth
                                size="small"
                                label="Booking ID"
                                placeholder="B1728208055403DEU9YS"
                                value={bookingId}
                                onChange={(event) => setBookingId(event.target.value)}
                                error={Boolean(error)}
                                helperText={error || ' '}
                            />
                        </Grid>
                        <Grid item xs={12} container justifyContent="flex-end" spacing={1}>
                            <Grid item>
                                <Button type="button" color="secondary" variant="outlined" onClick={close}>
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button type="submit" variant="contained" disabled={working}>
                                    {working ? 'Creating…' : 'Create link'}
                                </Button>
                            </Grid>
                        </Grid>
                    </>
                )}

                {link && (
                    <>
                        <Grid item xs={12}>
                            <Stack spacing={0.25}>
                                <Typography variant="subtitle1">{link.propertyName || 'Property'}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {[link.guestName, stayDates(link.dates), link.bookingId]
                                        .filter(Boolean).join(' · ')}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <ReviewLinkBox url={link.url} />
                        </Grid>
                        <Grid item xs={12}>
                            <Alert severity="info">
                                One review per link, valid until {moment(link.expiresAt).format('D MMM YYYY')}.
                                Anyone holding it can post that review, so send it to the guest only.
                            </Alert>
                        </Grid>
                        <Grid item xs={12} container justifyContent="flex-end">
                            <Button type="button" variant="contained" onClick={close}>Done</Button>
                        </Grid>
                    </>
                )}
            </Grid>
        </Dialog>
    )
}

export default CreateReviewLinkDialog;
