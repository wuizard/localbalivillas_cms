import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Chip,
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
import { EyeOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import moment from "moment";

import MainCard from "components/MainCard";
import { getEnquiries } from "services/enquiryService";

export const STATUS_OPTIONS = [
    { label: "Received", value: "new", color: "warning" },
    { label: "In conversation", value: "in_conversation", color: "info" },
    { label: "Quoted", value: "quoted", color: "primary" },
    { label: "Won", value: "won", color: "success" },
    { label: "Lost", value: "lost", color: "default" },
    { label: "Closed", value: "closed", color: "default" },
];

export const statusMeta = (value) =>
    STATUS_OPTIONS.find((option) => option.value === value) || STATUS_OPTIONS[0];

export const SOURCE_LABEL = {
    events_page: 'Events page',
    event_package: 'Event detail page',
    villa_page: 'Villa page',
    confirmation: 'Booking confirmation',
    nav: 'Navigation',
    direct: 'Direct',
};

function Enquiries() {
    const navigate = useNavigate()

    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        const { data, error } = await getEnquiries({})
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setRows(data.data || []) }
    }, [])

    useEffect(() => { load() }, [load])

    const dateOf = (enquiry) => {
        if (!enquiry.eventDate) { return enquiry.dateFlexible ? 'Flexible' : '-' }
        return moment(enquiry.eventDate).format('D MMM YYYY') + (enquiry.dateFlexible ? ' (flex)' : '')
    }

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">Enquiries</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Soonest event first. Nothing here is a booking &mdash; no dates are held.
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard content={false}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Reference</TableCell>
                                    <TableCell>Guest</TableCell>
                                    <TableCell>About</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Guests</TableCell>
                                    <TableCell>Source</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Open</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    [0, 1, 2].map((row) => (
                                        <TableRow key={row}>
                                            <TableCell colSpan={8}><Skeleton height={32} /></TableCell>
                                        </TableRow>
                                    ))
                                ) : rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                                                No enquiries yet.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : rows.map((enquiry) => {
                                    const meta = statusMeta(enquiry.lastStatus)
                                    return (
                                        <TableRow key={enquiry._id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="subtitle1" sx={{ fontFamily: 'monospace' }}>
                                                        {enquiry.reference}
                                                    </Typography>
                                                    {/* They opened WhatsApp. We cannot see whether they
                                                        pressed send, so the tooltip says exactly that. */}
                                                    {enquiry.handoffOpened && (
                                                        <Tooltip title="Opened WhatsApp — not proof they sent a message">
                                                            <WhatsAppOutlined style={{ color: '#25D366' }} />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                                {enquiry.needsReply && (
                                                    <Chip size="small" color="error" label="No reply yet" sx={{ mt: 0.5 }} />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{(enquiry.guest || {}).name}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {(enquiry.guest || {}).email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{(enquiry.subject || {}).name || '-'}</TableCell>
                                            <TableCell>{dateOf(enquiry)}</TableCell>
                                            <TableCell>{enquiry.guestCount || '-'}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption">
                                                    {SOURCE_LABEL[enquiry.source] || enquiry.source}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" color={meta.color} label={meta.label} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Open">
                                                    <IconButton onClick={() => navigate(`/enquiries/${enquiry._id}`)}>
                                                        <EyeOutlined />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                </MainCard>
            </Grid>
        </Grid>
    )
}

export default Enquiries;
