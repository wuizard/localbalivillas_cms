import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Button,
    Chip,
    IconButton,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import { CopyOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import moment from "moment";

import { createReviewLink, getReviewLinks, revokeReviewLink } from "services/reviewService";

export const copyLink = async (url) => {
    try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied")
    } catch (e) {
        // Clipboard access can be refused (an insecure origin, a locked-down browser).
        // Saying so beats a button that silently does nothing.
        toast.info("Press ⌘/Ctrl+C to copy the selected link")
    }
}

// The link, ready to paste into WhatsApp or an email. Read-only on purpose: the token
// in it is the credential, and an edited one simply stops working.
export function ReviewLinkBox({ url }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <TextField
                value={url}
                size="small"
                fullWidth
                InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: 12 } }}
                onFocus={(event) => event.target.select()}
            />
            <Tooltip title="Copy link">
                <IconButton onClick={() => copyLink(url)}>
                    <CopyOutlined />
                </IconButton>
            </Tooltip>
        </Stack>
    )
}

/**
 * The review link for one booking, in the state it is actually in: none yet, live and
 * waiting, already used, or revoked. Generating is idempotent - the API hands back the
 * live link rather than minting a second one, so two admins cannot put two links for
 * the same stay into circulation.
 */
function ReviewLinkPanel({ bookingId }) {
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [working, setWorking] = useState(false)

    const load = useCallback(async () => {
        if (!bookingId) { return }
        setLoading(true)
        const { data, error } = await getReviewLinks(bookingId)
        setLoading(false)
        if (error) { toast.error(error); return }
        if (data) { setLinks(data.data || []) }
    }, [bookingId])

    useEffect(() => { load() }, [load])

    const generate = async () => {
        setWorking(true)
        const { data, error } = await createReviewLink(bookingId)
        setWorking(false)
        if (error) { toast.error(error); return }
        if (data) { toast.success("Review link ready"); setLinks([data, ...links.filter((link) => link._id !== data._id)]) }
    }

    const revoke = async (link) => {
        setWorking(true)
        const { data, error } = await revokeReviewLink(link._id)
        setWorking(false)
        if (error) { toast.error(error); return }
        if (data) { toast.success("Link revoked"); load() }
    }

    if (loading) { return <Skeleton height={64} /> }

    const live = links.find((link) => link.isLive)
    const used = links.find((link) => link.usedAt)

    if (used) {
        return (
            <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" color="success" label="Reviewed" />
                    <Typography variant="caption" color="textSecondary">
                        {moment(used.usedAt).format('D MMM YYYY')}
                    </Typography>
                </Stack>
                <Typography variant="body2" color="textSecondary">
                    The guest submitted a review with this link. It cannot be used again.
                </Typography>
            </Stack>
        )
    }

    if (live) {
        return (
            <Stack spacing={1.5}>
                <ReviewLinkBox url={live.url} />
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" color="textSecondary">
                        Expires {moment(live.expiresAt).format('D MMM YYYY')}
                        {live.createdBy && live.createdBy.name ? ` · issued by ${live.createdBy.name}` : ''}
                    </Typography>
                    <Button size="small" color="error" disabled={working} onClick={() => revoke(live)}>
                        Revoke
                    </Button>
                </Stack>
                <Alert severity="info">
                    Anyone with this link can post one review for this stay &mdash; send it to the
                    guest only.
                </Alert>
            </Stack>
        )
    }

    return (
        <Stack spacing={1.5} alignItems="flex-start">
            <Typography variant="body2" color="textSecondary">
                Creates a private link the guest can review with, without having to match the
                email the booking was made under.
            </Typography>
            <Button variant="outlined" disabled={working} onClick={generate}>
                Create review link
            </Button>
        </Stack>
    )
}

export default ReviewLinkPanel;
