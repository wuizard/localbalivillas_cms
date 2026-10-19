import React, { useEffect, useState } from "react"

import {
    Alert,
    Button,
    Card,
    CardActionArea,
    Chip,
    CircularProgress,
    Dialog,
    Grid,
    Radio,
    Skeleton,
    Stack,
    Typography
} from "@mui/material"
import { toast } from "react-toastify"

import { getPaymentSettings, updatePaymentSettings } from "services/settingsService"
import { PAYMENT_PROVIDERS, providerLabel } from "helper/paymentProvider"

function PaymentGateway () {

    const [ active, setActive ] = useState(null)
    const [ providers, setProviders ] = useState([])
    const [ selected, setSelected ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const [ saving, setSaving ] = useState(false)
    const [ confirmOpen, setConfirmOpen ] = useState(false)

    useEffect(() => {
        load()
    }, [])

    const apply = (data) => {
        setActive(data.paymentGateway)
        setSelected(data.paymentGateway)
        setProviders(data.providers || [])
    }

    const load = async () => {
        setLoading(true)
        let { data, error } = await getPaymentSettings()
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { apply(data) }
    }

    const save = async () => {
        setConfirmOpen(false)
        setSaving(true)
        let { data, error } = await updatePaymentSettings({ paymentGateway: selected })
        setSaving(false)
        if (error) { toast.error(error) }
        if (data) {
            apply(data)
            toast.success(`New bookings now go through ${providerLabel(data.paymentGateway)}`)
        }
    }

    const changed = selected && selected !== active

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">Payment gateway</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Which provider charges guests for new villa bookings and activity orders.
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12} md={8}>
                <Stack spacing={1.5}>
                    {loading ? (
                        [0, 1].map((key) => <Skeleton key={key} variant="rounded" height={88} />)
                    ) : providers.map((provider) => {
                        const meta = PAYMENT_PROVIDERS[provider.name] || {}
                        const isSelected = selected === provider.name
                        return (
                            <Card
                                key={provider.name}
                                variant="outlined"
                                sx={{
                                    borderColor: isSelected ? 'primary.main' : undefined,
                                    borderWidth: isSelected ? 2 : 1,
                                    opacity: provider.configured ? 1 : 0.6,
                                }}
                            >
                                <CardActionArea
                                    disabled={!provider.configured || saving}
                                    onClick={() => { setSelected(provider.name) }}
                                    sx={{ p: 2 }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Radio
                                            checked={isSelected}
                                            disabled={!provider.configured}
                                            sx={{ p: 0, mt: 0.25 }}
                                            tabIndex={-1}
                                        />
                                        <Stack spacing={0.5} sx={{ flex: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="h5">{providerLabel(provider.name)}</Typography>
                                                {active === provider.name && (
                                                    <Chip size="small" color="success" label="Active" />
                                                )}
                                                {!provider.configured && (
                                                    <Chip size="small" variant="outlined" label="Not set up" />
                                                )}
                                            </Stack>
                                            {meta.description && (
                                                <Typography variant="body2" color="textSecondary">
                                                    {meta.description}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardActionArea>
                            </Card>
                        )
                    })}

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                            color="secondary"
                            variant="outlined"
                            disabled={!changed || saving}
                            onClick={() => { setSelected(active) }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            disabled={!changed || saving}
                            onClick={() => { setConfirmOpen(true) }}
                        >
                            {saving ? <CircularProgress size={22} style={{ color: 'white' }} /> : 'Save'}
                        </Button>
                    </Stack>
                </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
                <Alert severity="info">
                    <Stack spacing={1}>
                        <span>Changes apply from the next booking onwards.</span>
                        <span>Guests who already have a payment link can still pay with it.</span>
                        <span>A provider marked &ldquo;Not set up&rdquo; can&rsquo;t be chosen yet. Contact the tech team to enable it.</span>
                    </Stack>
                </Alert>
            </Grid>

            <Dialog open={confirmOpen} onClose={() => { setConfirmOpen(false) }}>
                <Grid container p={2.5} spacing={2} sx={{ maxWidth: 420 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            {`Switch to ${providerLabel(selected)}?`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {`Every new villa booking and activity order will be charged through ${providerLabel(selected)}. Open payment links from ${providerLabel(active)} are not affected.`}
                        </Typography>
                    </Grid>
                    <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                        <Grid item>
                            <Button color="secondary" variant="outlined" onClick={() => { setConfirmOpen(false) }}>
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={save}>
                                {`Switch to ${providerLabel(selected)}`}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default PaymentGateway
