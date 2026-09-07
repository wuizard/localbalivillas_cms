import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Chip, CircularProgress, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";

import { LBVInput } from "components/_lbvcomponents/LBVInput";
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel";
import ImageUploader from "components/_lbvcomponents/ImageUploader";
import { createEventPackage, getEventPackage, updateEventPackage } from "services/eventService";
import ListEditor from "../activities/ListEditor";

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }]
];

const EMPTY = {
    name: '',
    summary: '',
    description: '',
    typicallyIncludes: [],
    packageImage: [],
    indicativeFrom: '',
    indicativeTo: '',
    suitableGuestsMin: '',
    suitableGuestsMax: '',
};

const numberOrUndefined = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined
}

function AddEventPackage() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [form, setForm] = useState(EMPTY)
    const [status, setStatus] = useState('draft')
    const [loading, setLoading] = useState(Boolean(id))
    const [saving, setSaving] = useState(false)
    const [uploadingCount, setUploadingCount] = useState(0)

    const onChange = (patch) => setForm((prev) => ({ ...prev, ...patch }))

    const load = useCallback(async () => {
        if (!id) { return }
        setLoading(true)
        const { data, error } = await getEventPackage(id)
        setLoading(false)
        if (error) { toast.error(error); return }
        if (!data) { return }

        setStatus(data.status || 'published')
        setForm({
            ...EMPTY,
            ...data,
            typicallyIncludes: data.typicallyIncludes || [],
            packageImage: data.packageImage || [],
            indicativeFrom: data.indicativeFrom || '',
            indicativeTo: data.indicativeTo || '',
            suitableGuestsMin: data.suitableGuestsMin || '',
            suitableGuestsMax: data.suitableGuestsMax || '',
        })
    }, [id])

    useEffect(() => { load() }, [load])

    const missingFields = []
    if (!form.name || !form.name.trim()) { missingFields.push('Name') }
    if (!form.summary || !form.summary.trim()) { missingFields.push('Summary') }
    if (!form.packageImage || form.packageImage.length === 0) { missingFields.push('At least one image') }

    const save = async (nextStatus) => {
        if (nextStatus === 'published' && missingFields.length > 0) {
            toast.error(`Still missing: ${missingFields.join(', ')}`)
            return
        }

        setSaving(true)
        const body = {
            ...(id ? { _id: id } : {}),
            name: form.name,
            summary: form.summary,
            description: form.description,
            typicallyIncludes: form.typicallyIncludes,
            packageImage: form.packageImage,
            indicativeFrom: numberOrUndefined(form.indicativeFrom),
            indicativeTo: numberOrUndefined(form.indicativeTo),
            suitableGuestsMin: numberOrUndefined(form.suitableGuestsMin),
            suitableGuestsMax: numberOrUndefined(form.suitableGuestsMax),
            status: nextStatus,
        }

        const { data, error } = id ? await updateEventPackage(body) : await createEventPackage(body)
        setSaving(false)

        if (error) { toast.error(error); return }
        if (data) {
            toast.success(nextStatus === 'published' ? 'Event published' : 'Draft saved')
            navigate('/events')
        }
    }

    if (loading) {
        return <Card sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Card>
    }

    return (
        <Grid container>
            <Card sx={{ width: '100%', p: 2 }}>
                <Grid container>
                    <Grid item xs={12} p={2}>
                        <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                                <LBVTitleLabel>{id ? 'Edit event' : 'New event'}</LBVTitleLabel>
                            </Grid>
                            <Grid item>
                                <Chip size="small"
                                    label={status === 'draft' ? 'Draft' : 'Published'}
                                    color={status === 'draft' ? 'default' : 'success'} />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <LBVInput label="Name" placeHolder="Birthdays"
                                    value={form.name}
                                    onChange={(e) => onChange({ name: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <LBVInput label="Summary" type="textarea" rows={2}
                                    placeHolder="One line. It is the card text and the meta description."
                                    value={form.summary}
                                    onChange={(e) => onChange({ summary: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={6}>
                                <LBVInput label="Guests from" type="number"
                                    value={form.suitableGuestsMin}
                                    onChange={(e) => onChange({ suitableGuestsMin: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={6}>
                                <LBVInput label="Guests up to" type="number"
                                    value={form.suitableGuestsMax}
                                    onChange={(e) => onChange({ suitableGuestsMax: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <LBVLabel style={{ fontSize: 13, color: 'rgb(133, 133, 133)' }}>
                                    How it usually works
                                </LBVLabel>
                                <ReactQuill theme="snow"
                                    modules={{ toolbar: toolbarOptions }}
                                    value={form.description}
                                    onChange={(value) => onChange({ description: value })} />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <ImageUploader
                            uploadName="packageImage"
                            dirName="events"
                            title="Event images"
                            value={form.packageImage || []}
                            onChange={(images) => onChange({ packageImage: images })}
                            onPendingChange={setUploadingCount}
                        />
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <ListEditor title="Typically includes"
                            hint="What we usually arrange. Not a contract — the quote decides."
                            placeholder="Private chef dinner"
                            value={form.typicallyIncludes}
                            onChange={(value) => onChange({ typicallyIncludes: value })} />
                    </Grid>

                    <Grid item xs={12} md={6} p={2}>
                        <LBVTitleLabel>Indicative range</LBVTitleLabel>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={6}>
                                <LBVInput label="From (IDR)" type="number"
                                    value={form.indicativeFrom}
                                    onChange={(e) => onChange({ indicativeFrom: e.currentTarget.value })} />
                            </Grid>
                            <Grid item xs={6}>
                                <LBVInput label="To (IDR)" type="number"
                                    value={form.indicativeTo}
                                    onChange={(e) => onChange({ indicativeTo: e.currentTarget.value })} />
                            </Grid>
                        </Grid>
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Shown as &ldquo;typically from&rdquo; and never marked up as a price. Leave
                            blank if past events have been too varied to average.
                        </Alert>
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
                                <Button variant="outlined" onClick={() => navigate('/events')}>Cancel</Button>
                            </Grid>
                            <Grid item>
                                <Button variant="outlined" disabled={saving || uploadingCount > 0}
                                    onClick={() => save('draft')}>
                                    Save draft
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" sx={{ minWidth: 140 }}
                                    disabled={saving || uploadingCount > 0 || missingFields.length > 0}
                                    onClick={() => save('published')}>
                                    {saving
                                        ? <CircularProgress size={24} style={{ color: 'white' }} />
                                        : (status === 'draft' || !id) ? 'Publish' : 'Save'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    )
}

export default AddEventPackage;
