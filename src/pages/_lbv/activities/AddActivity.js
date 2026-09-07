import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Card, Chip, CircularProgress, Grid, Link } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";

import { LBVInput, LBVSelect } from "components/_lbvcomponents/LBVInput";
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel";
import ImageUploader from "components/_lbvcomponents/ImageUploader";
import { createActivity, getActivity, updateActivity } from "services/activityService";
import useCategories from "helper/useCategories";
import useRegions from "helper/useRegions";
import ListEditor from "./ListEditor";
import ActivityPrices from "./ActivityPrices";
// The blocked-date calendar is not activity-specific - it takes a date list and
// hands one back, so it is reused rather than forked.
import RoomsSchedule from "../places/rooms/RoomsSchedule";

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }]
];

const BASIS_OPTIONS = [
    { label: "Per person", value: "per_person" },
    { label: "Per group", value: "per_group" },
];

const EMPTY = {
    name: '',
    summary: '',
    description: '',
    category: null,
    region: '',
    regionId: null,
    location: '',
    locationId: null,
    meetingPoint: '',
    mapInfo: '',
    durationMinutes: '',
    capacityPerDay: '',
    childMaxAge: '',
    cancellationPolicy: '',
    basis: BASIS_OPTIONS[0],
    adult: '',
    child: '',
    minPax: '',
    maxPax: '',
    supplierName: '',
    supplierPhone: '',
    supplierEmail: '',
    activityImage: [],
    priceList: [],
    disabledDate: [],
    highlights: [],
    inclusions: [],
    exclusions: [],
    whatToBring: [],
};

const numberOrUndefined = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined
}

function AddActivity() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [form, setForm] = useState(EMPTY)
    // Inactive categories are still listed so an activity already filed under one
    // opens showing where it sits, rather than an empty picker.
    const { categories } = useCategories({ activeOnly: false })
    // Locations depend on the chosen region, so the loader is handed the region name
    // and resolves the rest itself.
    const { regionOptions, locationOptions } = useRegions(form.region)
    const categoryOptions = categories.map((category) => ({
        label: category.isActive === false ? `${category.name} (inactive)` : category.name,
        value: category.slug
    }))
    const [status, setStatus] = useState('draft')
    const [loading, setLoading] = useState(Boolean(id))
    const [saving, setSaving] = useState(false)
    const [uploadingCount, setUploadingCount] = useState(0)

    const onChange = (patch) => setForm((prev) => ({ ...prev, ...patch }))

    const load = useCallback(async () => {
        if (!id) { return }
        setLoading(true)
        const { data, error } = await getActivity(id)
        setLoading(false)
        if (error) { toast.error(error); return }
        if (!data) { return }

        setStatus(data.status || 'published')
        setForm({
            ...EMPTY,
            ...data,
            // kept as the stored slug - the picker resolves it to an option at
            // render time, so the form does not race the category list loading
            category: data.category || null,
            basis: BASIS_OPTIONS.find((option) => option.value === (data.pricing || {}).basis) || BASIS_OPTIONS[0],
            adult: (data.pricing || {}).adult || '',
            child: (data.pricing || {}).child || '',
            minPax: (data.pricing || {}).minPax || '',
            maxPax: (data.pricing || {}).maxPax || '',
            supplierName: (data.supplier || {}).name || '',
            supplierPhone: (data.supplier || {}).phone || '',
            supplierEmail: (data.supplier || {}).email || '',
            activityImage: data.activityImage || [],
            priceList: data.priceList || [],
            disabledDate: data.disabledDate || [],
            highlights: data.highlights || [],
            inclusions: data.inclusions || [],
            exclusions: data.exclusions || [],
            whatToBring: data.whatToBring || [],
            durationMinutes: data.durationMinutes || '',
            capacityPerDay: data.capacityPerDay || '',
            childMaxAge: data.childMaxAge || '',
        })
    }, [id])

    useEffect(() => { load() }, [load])

    // Mirrors the server's publish guard so the reason shows up here rather than as
    // a 400 after the click.
    const missingFields = []
    if (!form.name || !form.name.trim()) { missingFields.push('Name') }
    if (!form.summary || !form.summary.trim()) { missingFields.push('Summary') }
    if (!form.category) { missingFields.push('Category') }
    if (!form.activityImage || form.activityImage.length === 0) { missingFields.push('At least one image') }
    if (!numberOrUndefined(form.adult)) { missingFields.push('Adult price') }

    const payload = (nextStatus) => ({
        ...(id ? { _id: id } : {}),
        name: form.name,
        summary: form.summary,
        description: form.description,
        category: form.category || undefined,
        region: form.region,
        regionId: form.regionId || undefined,
        location: form.location,
        locationId: form.locationId || undefined,
        meetingPoint: form.meetingPoint,
        mapInfo: form.mapInfo,
        durationMinutes: numberOrUndefined(form.durationMinutes),
        capacityPerDay: numberOrUndefined(form.capacityPerDay),
        childMaxAge: numberOrUndefined(form.childMaxAge),
        cancellationPolicy: form.cancellationPolicy,
        pricing: {
            basis: form.basis ? form.basis.value : 'per_person',
            adult: numberOrUndefined(form.adult) || 0,
            child: numberOrUndefined(form.child) || 0,
            minPax: numberOrUndefined(form.minPax) || 1,
            maxPax: numberOrUndefined(form.maxPax),
        },
        supplier: {
            name: form.supplierName,
            phone: form.supplierPhone,
            email: form.supplierEmail,
        },
        activityImage: form.activityImage,
        priceList: form.priceList,
        disabledDate: form.disabledDate,
        highlights: form.highlights,
        inclusions: form.inclusions,
        exclusions: form.exclusions,
        whatToBring: form.whatToBring,
        status: nextStatus,
    })

    const save = async (nextStatus) => {
        if (nextStatus === 'published' && missingFields.length > 0) {
            toast.error(`Still missing: ${missingFields.join(', ')}`)
            return
        }

        setSaving(true)
        const body = payload(nextStatus)
        const { data, error } = id ? await updateActivity(body) : await createActivity(body)
        setSaving(false)

        if (error) { toast.error(error); return }
        if (data) {
            toast.success(nextStatus === 'published' ? 'Activity published' : 'Draft saved')
            navigate(nextStatus === 'published' ? '/activities' : '/activities/drafts')
        }
    }

    if (loading) {
        return (
            <Card sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Card>
        )
    }

    return (
        <Grid container>
            <Card sx={{ width: '100%', p: 2 }}>
                <Grid container>
                    <Grid item xs={12} p={2}>
                        <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                                <LBVTitleLabel>{id ? 'Edit activity' : 'New activity'}</LBVTitleLabel>
                            </Grid>
                            <Grid item>
                                <Chip
                                    size="small"
                                    label={status === 'draft' ? 'Draft' : 'Published'}
                                    color={status === 'draft' ? 'default' : 'success'}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <LBVInput label="Name" placeHolder="Mount Batur Sunrise Trek"
                                    value={form.name}
                                    onChange={(e) => onChange({ name: e.currentTarget.value })} />
                            </Grid>

                            <Grid item xs={12}>
                                <LBVInput label="Summary" type="textarea" rows={2}
                                    placeHolder="One line. It is the card text and the meta description."
                                    value={form.summary}
                                    onChange={(e) => onChange({ summary: e.currentTarget.value })} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LBVSelect label="Category"
                                    options={categoryOptions}
                                    value={categoryOptions.find((option) => option.value === form.category) || null}
                                    showInfo={categoryOptions.length ? null : (
                                        <>
                                            {'No categories yet - '}
                                            {/* A new tab, so a half-filled activity is not lost on the way
                                                out. The list refreshes when this tab is focused again. */}
                                            <Link
                                                href="/setting/categories"
                                                target="_blank"
                                                rel="noopener"
                                                sx={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}
                                            >
                                                add them in Settings &gt; Categories
                                            </Link>
                                        </>
                                    )}
                                    onChange={(e) => onChange({ category: e ? e.value : null })} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LBVSelect label="Region"
                                    options={regionOptions}
                                    value={regionOptions.find((option) => option.value === form.region) || null}
                                    placeHolder="Bali"
                                    onChange={(e) => onChange({
                                        region: e ? e.value : '',
                                        regionId: e ? e.data._id : null,
                                        // The areas belong to a region, so changing it
                                        // invalidates whatever was chosen before.
                                        location: '',
                                        locationId: null
                                    })} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LBVSelect label="Location"
                                    options={locationOptions}
                                    value={locationOptions.find((option) => option.value === form.location) || null}
                                    disabled={!form.region}
                                    placeHolder={form.region ? "Ubud, Canggu, Nusa Dua…" : "Choose a region first"}
                                    showInfo={form.region && !locationOptions.length
                                        ? "No locations in this region yet - add them in Settings > Location"
                                        : null}
                                    onChange={(e) => onChange({
                                        location: e ? e.value : '',
                                        locationId: e ? e.data._id : null
                                    })} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LBVInput label="Duration (minutes)" type="number"
                                    value={form.durationMinutes}
                                    onChange={(e) => onChange({ durationMinutes: e.currentTarget.value })} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LBVInput label="Places per day" type="number"
                                    value={form.capacityPerDay}
                                    onChange={(e) => onChange({ capacityPerDay: e.currentTarget.value })} />
                            </Grid>

                            <Grid item xs={12}>
                                <LBVInput label="Meeting point" placeHolder="Hotel lobby pick-up"
                                    value={form.meetingPoint}
                                    onChange={(e) => onChange({ meetingPoint: e.currentTarget.value })} />
                            </Grid>

                            <Grid item xs={12}>
                                <LBVLabel style={{ fontSize: 13, color: 'rgb(133, 133, 133)' }}>Description</LBVLabel>
                                <ReactQuill theme="snow"
                                    modules={{ toolbar: toolbarOptions }}
                                    value={form.description}
                                    onChange={(value) => onChange({ description: value })} />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <ImageUploader
                            uploadName="activityImage"
                            dirName="activities"
                            title="Activity images"
                            value={form.activityImage || []}
                            onChange={(images) => onChange({ activityImage: images })}
                            onPendingChange={setUploadingCount}
                        />
                    </Grid>

                    <Grid item xs={12} p={2}>
                        <LBVTitleLabel>Pricing</LBVTitleLabel>
                        {/* Two rows of four rather than six squeezed into one: at md={1}
                            the age label wrapped onto a second line and dropped its field
                            out of line with the rest. Rates first, then party size. */}
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <LBVSelect label="Charged" options={BASIS_OPTIONS}
                                    value={form.basis}
                                    onChange={(e) => onChange({ basis: e })} />
                            </Grid>
                            <Grid item xs={6} sm={6} md={3}>
                                <LBVInput label="Adult (IDR)" type="number"
                                    value={form.adult}
                                    onChange={(e) => onChange({ adult: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={6} sm={6} md={3}>
                                <LBVInput label="Child (IDR)" type="number"
                                    value={form.child}
                                    onChange={(e) => onChange({ child: e.currentTarget.value })} />
                            </Grid>
                            {/* Full width on a phone so it ends the rate group rather than
                                pairing with Min people and splitting rates from capacity. */}
                            <Grid item xs={12} sm={6} md={3}>
                                <LBVInput label="Child up to age" type="number"
                                    value={form.childMaxAge}
                                    onChange={(e) => onChange({ childMaxAge: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={6} sm={6} md={3}>
                                <LBVInput label="Min people" type="number"
                                    value={form.minPax}
                                    onChange={(e) => onChange({ minPax: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={6} sm={6} md={3}>
                                <LBVInput label="Max people" type="number"
                                    value={form.maxPax}
                                    onChange={(e) => onChange({ maxPax: e.currentTarget.value })} />
                            </Grid>
                        </Grid>
                        <Alert severity="info" sx={{ mt: 2 }}>
                            The rate every date uses unless a rule below says otherwise. Anyone at
                            or under the child age pays the child rate; everyone else pays the
                            adult rate.
                        </Alert>
                    </Grid>

                    <Grid item xs={12} p={2}>
                        <ActivityPrices
                            priceList={form.priceList || []}
                            setPriceList={(priceList) => onChange({ priceList })}
                        />
                    </Grid>

                    <Grid item xs={12} p={2}>
                        <LBVTitleLabel>Dates it cannot run</LBVTitleLabel>
                        <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                            Blocked dates are crossed out on the website and cannot be chosen.
                        </LBVLabel>
                        <Box sx={{ mt: 1.5 }}>
                            <RoomsSchedule
                                hideTitle
                                disabledDate={form.disabledDate || []}
                                setDisableDay={(dates) => onChange({ disabledDate: dates })}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <ListEditor title="Highlights"
                            hint="The three or four things someone remembers afterwards."
                            placeholder="Sunrise from the crater rim"
                            value={form.highlights}
                            onChange={(value) => onChange({ highlights: value })} />
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <ListEditor title="What to bring"
                            placeholder="Warm layer"
                            value={form.whatToBring}
                            onChange={(value) => onChange({ whatToBring: value })} />
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <ListEditor title="Included"
                            placeholder="Hotel pick-up and drop-off"
                            value={form.inclusions}
                            onChange={(value) => onChange({ inclusions: value })} />
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <ListEditor title="Not included"
                            hint="The column that prevents most arguments on the day."
                            placeholder="Tips"
                            value={form.exclusions}
                            onChange={(value) => onChange({ exclusions: value })} />
                    </Grid>

                    <Grid item xs={12} p={2}>
                        <LBVInput label="If plans change" type="textarea" rows={2}
                            placeHolder="Free to move to another date if the weather closes the trail."
                            value={form.cancellationPolicy}
                            onChange={(e) => onChange({ cancellationPolicy: e.currentTarget.value })} />
                    </Grid>

                    <Grid item xs={12} p={2}>
                        <LBVTitleLabel>Supplier</LBVTitleLabel>
                        <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                            Internal only. Never shown on the website.
                        </LBVLabel>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} md={4}>
                                <LBVInput label="Name" value={form.supplierName}
                                    onChange={(e) => onChange({ supplierName: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <LBVInput label="Phone" value={form.supplierPhone}
                                    onChange={(e) => onChange({ supplierPhone: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <LBVInput label="Email" value={form.supplierEmail}
                                    onChange={(e) => onChange({ supplierEmail: e.currentTarget.value })} />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} p={2}>
                        {missingFields.length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                Needed before this can go live: {missingFields.join(', ')}.
                                You can still save it as a draft.
                            </Alert>
                        )}

                        <Grid container spacing={1} alignItems="center">
                            <Grid item>
                                <Button variant="outlined" onClick={() => navigate('/activities')}>
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button variant="outlined" color="primary"
                                    disabled={saving || uploadingCount > 0}
                                    onClick={() => save('draft')}>
                                    Save draft
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" color="primary"
                                    sx={{ minWidth: 140 }}
                                    disabled={saving || uploadingCount > 0 || missingFields.length > 0}
                                    onClick={() => save('published')}>
                                    {saving
                                        ? <CircularProgress size={24} style={{ color: 'white' }} />
                                        : (status === 'draft' || !id) ? 'Publish' : 'Save'}
                                </Button>
                            </Grid>
                            {uploadingCount > 0 && (
                                <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LBVLabel style={{ fontSize: 12, color: '#858585' }}>
                                        Waiting for {uploadingCount} upload{uploadingCount > 1 ? 's' : ''} to finish
                                    </LBVLabel>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    )
}

export default AddActivity;
