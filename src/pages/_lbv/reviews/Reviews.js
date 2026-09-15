import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    Grid,
    InputAdornment,
    MenuItem,
    Rating,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { SearchOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import moment from "moment";

import MainCard from "components/MainCard";
import { getReviews } from "services/reviewService";

// The API pages reviews 20 at a time, same as every other list here.
const PAGE_SIZE = 20

const RATING_OPTIONS = [5, 4, 3, 2, 1]

const emptyFilter = () => ({ search: '', rating: '', page: 0 })

// A guest may have signed up with a full name, a first/last pair, or neither.
const guestName = (user) => {
    if (!user) { return 'Unknown guest' }
    const parts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    return user.name || parts || user.email || 'Unknown guest'
}

function Reviews() {
    const [rows, setRows] = useState([])
    const [totalData, setTotalData] = useState(0)
    const [averageRating, setAverageRating] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState(emptyFilter())
    const [reading, setReading] = useState(null)

    // Same 500ms the other lists use - one request per pause, not per keystroke.
    const [debouncedFilter] = useDebounce(filter, 500)

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedFilter])

    const loadData = async () => {
        setLoading(true)
        const { data, error } = await getReviews({
            search: debouncedFilter.search || '',
            rating: debouncedFilter.rating || '',
            page: debouncedFilter.page || 0,
        })
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) {
            setRows(data.data || [])
            setTotalData(data.totalData || 0)
            setAverageRating(data.averageRating)
        }
    }

    // Any filter change other than the page itself puts you back on page one -
    // otherwise a narrower search lands on an empty page 4.
    const changeFilter = (patch) => setFilter((prev) => ({ ...prev, ...patch, page: 0 }))

    const hasFilter = !!(filter.search || filter.rating)

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">Reviews</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Newest first. Every review here was left by a guest with a matching stay &mdash;
                        the website&apos;s placeholder cards are not stored and never appear in this list.
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                        <TextField
                            size="small"
                            placeholder="Guest, property or review text"
                            value={filter.search}
                            onChange={(e) => changeFilter({ search: e.target.value })}
                            sx={{ minWidth: 280 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlined />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            select
                            size="small"
                            label="Rating"
                            value={filter.rating}
                            onChange={(e) => changeFilter({ rating: e.target.value })}
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value="">All ratings</MenuItem>
                            {RATING_OPTIONS.map((score) => (
                                <MenuItem key={score} value={score}>
                                    {score} star{score > 1 ? 's' : ''}
                                </MenuItem>
                            ))}
                        </TextField>
                        {hasFilter && (
                            <Button color="secondary" onClick={() => setFilter(emptyFilter())}>
                                Clear
                            </Button>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        {!loading && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" color="textSecondary">
                                    {totalData} review{totalData === 1 ? '' : 's'}
                                </Typography>
                                {averageRating != null && (
                                    <Chip
                                        size="small"
                                        color="primary"
                                        label={`${averageRating.toFixed(1)} average`}
                                    />
                                )}
                            </Stack>
                        )}
                    </Stack>
                </MainCard>
            </Grid>

            <Grid item xs={12}>
                <MainCard content={false}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Guest</TableCell>
                                    <TableCell>Property</TableCell>
                                    <TableCell>Rating</TableCell>
                                    <TableCell>Review</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && [0, 1, 2].map((row) => (
                                    <TableRow key={row}>
                                        <TableCell colSpan={5}><Skeleton height={32} /></TableCell>
                                    </TableRow>
                                ))}

                                {!loading && rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 5 }}>
                                                {hasFilter
                                                    ? 'No reviews match these filters.'
                                                    : 'No guest has left a review yet.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && rows.map((review) => {
                                    const user = review.user || null
                                    const property = review.property || null
                                    const country = user && user.country ? user.country.name : ''
                                    const images = review.images || []

                                    return (
                                        <TableRow key={review._id} hover>
                                            <TableCell>
                                                <Typography variant="body2">{guestName(user)}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {[user && user.email, country].filter(Boolean).join(' · ')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 220 }}>
                                                <Stack sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" noWrap>
                                                        {property ? property.name : 'Property removed'}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary" noWrap>
                                                        {property ? (property.region || '') : ''}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.75} alignItems="center">
                                                    <Rating value={review.rating || 0} precision={0.5} size="small" readOnly />
                                                    <Typography variant="caption" color="textSecondary">
                                                        {review.rating || '-'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 420 }}>
                                                {/* Clamped to two lines - the full text opens in a dialog, so a
                                                    long review cannot push every other row off the screen. */}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        cursor: review.review ? 'pointer' : 'default'
                                                    }}
                                                    onClick={() => { if (review.review) { setReading(review) } }}
                                                >
                                                    {review.review || <em>No written review</em>}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    {images.length > 0 && (
                                                        <Typography variant="caption" color="textSecondary">
                                                            {images.length} photo{images.length === 1 ? '' : 's'}
                                                        </Typography>
                                                    )}
                                                    {review.isUpdated && (
                                                        <Chip size="small" variant="outlined" label="Edited" />
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {moment(review.createdDate).format('DD MMM YYYY')}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {moment(review.createdDate).format('HH:mm')}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Box>

                    <TablePagination
                        component="div"
                        count={totalData}
                        rowsPerPage={PAGE_SIZE}
                        rowsPerPageOptions={[PAGE_SIZE]}
                        page={filter.page}
                        onPageChange={(event, page) => setFilter((prev) => ({ ...prev, page }))}
                    />
                </MainCard>
            </Grid>

            <Dialog open={!!reading} onClose={() => setReading(null)} maxWidth="sm" fullWidth>
                <Grid container p={2.5} spacing={2}>
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Typography variant="h5">{guestName(reading && reading.user)}</Typography>
                            <Rating value={(reading && reading.rating) || 0} precision={0.5} size="small" readOnly />
                        </Stack>
                        <Typography variant="caption" color="textSecondary">
                            {reading && reading.property ? reading.property.name : 'Property removed'}
                            {reading ? ` · ${moment(reading.createdDate).format('DD MMM YYYY')}` : ''}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {reading ? reading.review : ''}
                        </Typography>
                    </Grid>
                    {reading && (reading.images || []).length > 0 && (
                        <Grid item xs={12}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {reading.images.map((image) => (
                                    <Box
                                        key={image}
                                        component="img"
                                        src={image}
                                        alt=""
                                        sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                ))}
                            </Stack>
                        </Grid>
                    )}
                    <Grid item xs={12} container justifyContent="flex-end">
                        <Button variant="outlined" color="secondary" onClick={() => setReading(null)}>
                            Close
                        </Button>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default Reviews;
