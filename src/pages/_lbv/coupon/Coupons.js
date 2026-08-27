import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
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
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import MainCard from "components/MainCard";
import { currencyFormat } from "helper/numberHelper";
import { deleteCoupon, getCouponList } from "services/couponService";

function Coupons () {
    const navigate = useNavigate()

    const [ rows, setRows ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ deleteDialog, setDeleteDialog ] = useState({ open: false, coupon: null })

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = async () => {
        setLoading(true)
        let { data, error } = await getCouponList()
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setRows(data) }
    }

    const deleteCoupons = async (_id) => {
        setDeleteDialog({ open: false, coupon: null })
        let { data, error } = await deleteCoupon({_id})
        if (error) { toast.error(error) }
        if (data) { toast.success("Coupon deleted"); loadCoupons() }
    }

    // A coupon is either a percentage off or a flat amount off.
    const discountOf = (coupon) => {
        if (!coupon.amount) { return '-' }
        return coupon.couponType === 'percentage' ? `${coupon.amount}%` : currencyFormat(coupon.amount)
    }

    const conditionOf = (coupon) => {
        let conditions = []
        if (coupon.minimumPurchase) { conditions.push(`min. spend ${currencyFormat(coupon.minimumPurchase)}`) }
        if (coupon.minimumDays) { conditions.push(`min. ${coupon.minimumDays} night${coupon.minimumDays === 1 ? '' : 's'}`) }
        return conditions.length ? conditions.join(', ') : 'No minimum'
    }

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="h4">Coupons</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Discount codes guests can apply at checkout.
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<PlusOutlined />}
                        onClick={() => { navigate('/coupons/add-coupon') }}
                    >
                        Add Coupon
                    </Button>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard
                    title="All Coupons"
                    content={false}
                    secondary={
                        <Typography variant="caption" color="textSecondary">
                            {`${rows.length} coupon${rows.length === 1 ? '' : 's'}`}
                        </Typography>
                    }
                >
                    {/* The table keeps its own scroll so narrow screens never widen the page. */}
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Coupon</TableCell>
                                    <TableCell>Code</TableCell>
                                    <TableCell>Discount</TableCell>
                                    <TableCell>Conditions</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    loading &&
                                    [0, 1, 2].map(row => (
                                        <TableRow key={row}>
                                            <TableCell colSpan={5}><Skeleton height={34} /></TableCell>
                                        </TableRow>
                                    ))
                                }

                                {
                                    !loading && !rows.length &&
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 5 }}>
                                                No coupons yet - add one to start offering a discount.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    !loading && rows.map(coupon => (
                                        <TableRow key={coupon._id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2">{coupon.name || '-'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={coupon.couponCode}
                                                    sx={{ bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 500, fontFamily: 'monospace' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{discountOf(coupon)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="textSecondary">{conditionOf(coupon)}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="Edit coupon">
                                                        <IconButton size="small" color="primary" onClick={() => {
                                                            navigate(`/coupons/${coupon._id}`)
                                                        }}>
                                                            <EditOutlined />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete coupon">
                                                        <IconButton size="small" color="error" onClick={() => {
                                                            setDeleteDialog({ open: true, coupon })
                                                        }}>
                                                            <DeleteOutlined />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </Box>
                </MainCard>
            </Grid>

            <Dialog open={deleteDialog.open} onClose={() => { setDeleteDialog({ open: false, coupon: null }) }}>
                <Grid container p={2.5} spacing={2} sx={{ maxWidth: 420 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>Delete coupon?</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {`"${deleteDialog.coupon ? (deleteDialog.coupon.name || deleteDialog.coupon.couponCode) : ''}" will stop working at checkout. This cannot be undone.`}
                        </Typography>
                    </Grid>
                    <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                        <Grid item>
                            <Button color="secondary" variant="outlined" onClick={() => {
                                setDeleteDialog({ open: false, coupon: null })
                            }}>Cancel</Button>
                        </Grid>
                        <Grid item>
                            <Button color="error" variant="contained" onClick={() => {
                                if (deleteDialog.coupon) { deleteCoupons(deleteDialog.coupon._id) }
                            }}>Delete</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default Coupons
