import React from "react"
import { Button, Card, Divider, Grid, Typography } from "@mui/material"
import moment from "moment"

import { LBVTitleLabel } from "components/_lbvcomponents/LBVLabel"
import { currencyFormat } from "helper/numberHelper"
import { channelLabel, providerLabel, providerOf } from "helper/paymentProvider"

function Row({ label, children }) {
    if (children === null || children === undefined || children === '') { return null }
    return (
        <Grid container spacing={1} sx={{ py: 0.75 }}>
            <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="textSecondary">{label}</Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{children}</Typography>
            </Grid>
        </Grid>
    )
}

/**
 * Which gateway an order went through and what it reported back. Shared by the
 * villa and activity detail screens so the two cannot drift apart.
 *
 * "Paid" here is only what the gateway confirmed. An order marked paid by hand,
 * or paid through a provider with no notification wired up, shows "Not confirmed
 * by gateway" - check the provider's dashboard for those.
 */
function PaymentInfoCard({ order, sx }) {
    if (!order || (!order.paymentLink && !order.paymentProvider)) { return null }

    const info = order.paymentInfo || {}

    return (
        <Card sx={{ p: 3, ...sx }}>
            <LBVTitleLabel>Payment</LBVTitleLabel>
            <Divider sx={{ my: 1.5 }} />
            <Row label="Provider">{providerLabel(providerOf(order))}</Row>
            <Row label="Paid">
                {info.paidAt
                    ? `${moment(info.paidAt).format('D MMM YYYY, HH:mm')}${info.amount ? ` · ${currencyFormat(info.amount)}` : ''}`
                    : 'Not confirmed by gateway'}
            </Row>
            <Row label="Method">{channelLabel(info.channel)}</Row>
            <Row label="Reference">{order.paymentRef}</Row>
            {order.paymentLink && (
                <Button variant="outlined" fullWidth sx={{ mt: 1.5 }}
                    href={order.paymentLink} target="_blank" rel="noopener noreferrer">
                    Open payment link
                </Button>
            )}
        </Card>
    )
}

export default PaymentInfoCard
