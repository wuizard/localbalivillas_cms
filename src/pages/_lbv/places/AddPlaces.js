import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { LBVInput, LBVSelect } from "../../../components/_lbvcomponents/LBVInput"
import { Box, Button, Grid, CircularProgress, Chip, Alert, Paper, Stack, Typography } from "@mui/material"
import MainCard from "components/MainCard"
import ReactQuill from "react-quill"
import { LBVLabel } from "../../../components/_lbvcomponents/LBVLabel"
import ImageUploader from "../../../components/_lbvcomponents/ImageUploader"
import Rooms from "./rooms/Rooms"
import { createProperties, getProperty, updateProperties } from "../../../services/propertiesService"
import { useNavigate, useParams } from 'react-router-dom';

import { getValuefromArrayObject } from "helper/objectHelper"
import { typeOptions } from "helper/constant"
import { currencyFormat } from "helper/numberHelper"
import { clientId, ensureClientId } from "helper/id"

import { loadLocation, loadRegion } from "services/regionService"
import { toast } from "react-toastify"

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }]
];

// Long enough that it does not fire mid-sentence, short enough that a browser
// crash costs at most this much work.
const AUTOSAVE_DELAY_MS = 20000

const emptyForm = {
    name: "",
    region: null,
    regionId: null,
    location: null,
    locationId: null,
    image: "",
    type: null,
    bedRooms: null,
    description: "",
    houseRules: "",
    mapInfo: "",
    propertyImages: []
}

function AddPlaces () {

    const [ form, setForm ] = useState(emptyForm)
    const [ rooms, setRooms ] = useState([])
    const [ status, setStatus ] = useState(null)

    const [ saving, setSaving ] = useState(false)
    const [ savingDraft, setSavingDraft ] = useState(false)
    const [ autoSavedAt, setAutoSavedAt ] = useState(null)
    const [ dirty, setDirty ] = useState(false)

    // roomKey -> number of files still going to S3. 'property' is the top-level gallery.
    const [ pendingUploads, setPendingUploads ] = useState({})

    const [ regions, setRegions ] = useState([])
    const [ locations, setLocations ] = useState([])

    const { id } = useParams();
    const navigate = useNavigate()

    const loadedRef = useRef(false)
    // Serialised form+rooms as of the last successful load or save. Comparing
    // against it means autosave only fires on a real edit, never on a reload.
    const savedSnapshotRef = useRef(null)

    const uploadingCount = useMemo(
        () => Object.keys(pendingUploads).reduce((total, key) => total + (pendingUploads[key] || 0), 0),
        [pendingUploads]
    )

    // Mirrors the server's publish check, so the button state and the API agree.
    const missingFields = useMemo(() => {
        const missing = []
        if (!form.name) { missing.push('name') }
        if (!optionValue(form.region, form.regionId)) { missing.push('region') }
        if (!optionValue(form.location, form.locationId)) { missing.push('location') }
        if (!form.propertyImages || form.propertyImages.length === 0) { missing.push('at least one image') }
        return missing
    }, [form])

    const isDraft = status === 'draft'
    const busy = saving || savingDraft

    useEffect(() => {
        getRegion()
    }, [])

    useEffect(() => {
        // Wait for regions before loading, otherwise the region select resolves to
        // null. The old version also fired on the initial empty array.
        if (id && regions.length > 0 && !loadedRef.current) { loadDetail() }
        if (!id) { loadedRef.current = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [regions, id])

    useEffect(() => {
        getLocation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.region])

    useEffect(() => {
        if (!loadedRef.current || savedSnapshotRef.current === null) { return }
        setDirty(snapshotOf(form, rooms) !== savedSnapshotRef.current)
    }, [form, rooms])

    // --- autosave ------------------------------------------------------------
    // Only ever runs on drafts. Autosaving a published property would push
    // half-finished edits onto the live site.
    useEffect(() => {
        if (!id || !isDraft || !dirty || busy) { return }
        if (uploadingCount > 0) { return }

        const timer = setTimeout(() => { save('draft', { silent: true }) }, AUTOSAVE_DELAY_MS)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isDraft, dirty, busy, uploadingCount, form, rooms])

    // Last line of defence if they close the tab with unsaved changes.
    useEffect(() => {
        const handler = (event) => {
            if (!dirty && uploadingCount === 0) { return }
            event.preventDefault()
            event.returnValue = ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [dirty, uploadingCount])

    const getRegion = async () => {
        let { data, error } = await loadRegion()
        if (error || !data) { toast.error("Could not load regions"); return }
        setRegions(data.map((region) => ({
            label: region.regionName,
            value: region._id,
            data: region
        })))
    }

    const getLocation = async () => {
        if (!form.region || !form.region.data) { return }
        let { data, error } = await loadLocation(form.region.data.regionId)
        if (error || !data) { return }
        const locationList = data.map((location) => ({
            label: location.locationName,
            value: location._id,
            data: location
        }))
        if (form.locationId) {
            const resolved = getValuefromArrayObject(locationList, form.locationId)
            if (resolved) { setForm(prev => ({ ...prev, location: resolved })) }
        }
        setLocations(locationList)
    }

    const onChange = (e) => {
        setForm(prev => ({ ...prev, ...e }))
    }

    const setPropertyImages = useCallback((images) => {
        setForm(prev => ({ ...prev, propertyImages: images }))
    }, [])

    const setPropertyPending = useCallback((count) => {
        setPendingUploads(prev => ({ ...prev, property: count }))
    }, [])

    const setRoomPending = useCallback((roomKey, count) => {
        setPendingUploads(prev => ({ ...prev, [roomKey]: count }))
    }, [])

    // Immutable, and keyed off the render's index. The old version wrote straight
    // into the rooms array before calling setState.
    const saveRoomInfo = useCallback((roomData, index) => {
        setRooms(prev => prev.map((room, i) => (i === index ? { ...room, ...roomData } : room)))
    }, [])

    const deleteRoom = useCallback((index) => {
        setRooms(prev => prev.filter((_, i) => i !== index))
    }, [])

    // Every field AddRooms defaults internally is set here too, so the parent's
    // copy is complete from the start and AddRooms never has to write back on mount.
    const addRoom = useCallback(() => {
        setRooms(prev => ([...prev, {
            clientId: clientId('room'),
            propertyImage: [],
            roomImages: [],
            priceList: [],
            disabledDate: [],
            amenities: [],
            facilities: {
                swimmingPool: false,
                publicPool: false,
                privatePool: false,
                airportShuttle: false,
                restaurant: false,
                breakfast: false,
                freeParking: false
            },
            maximumGuest: { adult: null, child: null, total: null },
            roomSize: null,
            poolSize: null,
            name: "",
            room: "",
            bed: "",
            price: 0,
            features: null,
        }]))
    }, [])

    const loadDetail = async () => {
        try {
            let { data, error } = await getProperty(id)
            if (error) { toast.error(error); return }
            if (!data) { return }

            const nextForm = {
                ...emptyForm,
                ...data,
                region: getValuefromArrayObject(regions, data.regionId),
                type: getValuefromArrayObject(typeOptions, data.type),
                propertyImages: data.propertyImage || [],
            }

            const nextRooms = (data.rooms || []).map((room) => ({
                ...room,
                clientId: ensureClientId(room),
                roomImages: room.propertyImage || [],
                priceList: room.priceList || [],
                defaultPrice: {
                    price: room.price || 0,
                    format: currencyFormat(room.price || 0)
                }
            }))

            setStatus(data.status || 'published')
            setForm(nextForm)
            setRooms(nextRooms)
            markClean(nextForm, nextRooms)
        } catch (error) {
            toast.error("Could not load this property")
        } finally {
            loadedRef.current = true
        }
    }

    // Records the current state as "saved", so the next edit is what marks dirty.
    const markClean = (nextForm, nextRooms) => {
        savedSnapshotRef.current = snapshotOf(nextForm, nextRooms)
        setDirty(false)
    }

    // Builds the request body. Nothing here mutates state - the previous version
    // rewrote priceList[j].day in place, so a second save found a string instead
    // of a { label, value } and silently dropped every day-based price.
    const buildPayload = (nextStatus) => ({
        _id: id,
        name: form.name,
        propertyImage: form.propertyImages || [],
        region: optionLabel(form.region),
        regionId: optionValue(form.region, form.regionId),
        location: optionLabel(form.location),
        locationId: optionValue(form.location, form.locationId),
        type: optionValue(form.type, null),
        description: form.description,
        houseRules: form.houseRules,
        mapInfo: form.mapInfo,
        status: nextStatus,
        rooms: rooms.map((room) => ({
            _id: room._id,
            name: room.name,
            room: room.room,
            bed: room.bed,
            price: room.price,
            defaultPrice: room.defaultPrice,
            facilities: room.facilities,
            amenities: room.amenities,
            roomSize: room.roomSize,
            poolSize: room.poolSize,
            maximumGuest: room.maximumGuest,
            disabledDate: room.disabledDate,
            isActive: room.isActive,
            // roomImages is the CMS's working field; the API stores propertyImage
            propertyImage: room.roomImages || [],
            priceList: (room.priceList || []).map((price) => ({
                ...price,
                day: price.day ? (price.day.label || price.day) : null,
            })),
        })),
    })

    const save = async (nextStatus, { silent = false } = {}) => {
        if (busy) { return }
        if (uploadingCount > 0) {
            toast.info(`${uploadingCount} image${uploadingCount > 1 ? 's are' : ' is'} still uploading`)
            return
        }
        if (nextStatus === 'published' && missingFields.length > 0) {
            toast.error(`Cannot publish, still missing: ${missingFields.join(', ')}`)
            return
        }

        if (nextStatus === 'draft') { setSavingDraft(true) } else { setSaving(true) }

        try {
            const payload = buildPayload(nextStatus)

            if (id) {
                const { data, error } = await updateProperties(payload)
                if (error) { throw new Error(error) }
                setStatus(data && data.status ? data.status : nextStatus)
                markClean(form, rooms)
                if (silent) {
                    setAutoSavedAt(new Date())
                } else {
                    toast.success(nextStatus === 'draft' ? "Draft saved" : "Property published")
                    // Re-read so server-assigned room and price ids land in state,
                    // otherwise the next save re-creates every room from scratch.
                    await loadDetail()
                }
            } else {
                const { data, error } = await createProperties(payload)
                if (error) { throw new Error(error) }
                if (!data || !data._id) { throw new Error("The server did not return the new property") }
                markClean(form, rooms)
                toast.success(nextStatus === 'draft' ? "Draft created" : "Property published")
                // Same component instance serves add-place and :id, so clear the
                // guard to let the id route load the server's copy - the local
                // rooms have no _id yet and would otherwise be recreated next save.
                loadedRef.current = false
                navigate(`/places/${data._id}`, { replace: true })
            }
        } catch (error) {
            // The old code threw out of an un-awaited onClick handler, so a failed
            // save produced an unhandled rejection and absolutely no UI feedback.
            const message = error && error.message ? error.message : "Could not save this property"
            if (silent) {
                toast.warn(`Autosave failed: ${message}`)
            } else {
                toast.error(message)
            }
        } finally {
            setSaving(false)
            setSavingDraft(false)
        }
    }

    return (
        <Box sx={{ pb: 2 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1.5}
                sx={{ mb: 2 }}
            >
                <Stack spacing={0.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h4">
                            {id ? (form.name || 'Edit property') : 'New property'}
                        </Typography>
                        {isDraft && <Chip label="Draft" size="small" color="warning" />}
                    </Stack>
                    <Typography variant="body2" color="textSecondary">
                        {id
                            ? 'Changes are not live until you save.'
                            : 'Save a draft to start autosaving. Nothing is published until you press Publish.'}
                    </Typography>
                </Stack>

                <Button variant="outlined" onClick={() => navigate('/places')}>
                    Back to places
                </Button>
            </Stack>

            <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={7}>
                    <MainCard title="Basics">
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <LBVInput label={"Name"}
                                    placeHolder="Input property name"
                                    value={form.name} onChange={(e) => {
                                    onChange({ name: e.currentTarget.value })
                                }}/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <LBVSelect label={"Region"}
                                    value={form.region}
                                    options={regions}
                                    onChange={(e) => { onChange({ region: e, location: null, locationId: null }) }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <LBVSelect label={"Location"}
                                    value={form.location}
                                    options={locations}
                                    onChange={(e) => { onChange({ location: e }) }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <LBVSelect label={"Type"}
                                    value={form.type}
                                    options={typeOptions}
                                    onChange={(e) => { onChange({ type: e }) }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <LBVInput label={"Map URL"}
                                    placeHolder="Paste the Google Maps embed code or a plain URL"
                                    value={form.mapInfo} onChange={(e) => {
                                    onChange({ mapInfo: extractMapUrl(e.currentTarget.value) })
                                }}/>
                            </Grid>
                        </Grid>
                    </MainCard>
                </Grid>

                <Grid item xs={12} md={5}>
                    <MainCard
                        title="Images"
                        secondary={
                            <Typography variant="caption" color="textSecondary">
                                {(form.propertyImages || []).length} added
                            </Typography>
                        }
                    >
                        <ImageUploader
                            uploadName="addonImage"
                            dirName="properties"
                            title="Property Images"
                            value={form.propertyImages || []}
                            onChange={setPropertyImages}
                            onPendingChange={setPropertyPending}
                        />
                    </MainCard>
                </Grid>

                {/* Rich text needs the full width - at half width the toolbar wraps and
                    long paragraphs become a column two words wide. */}
                <Grid item xs={12}>
                    <MainCard title="Description and house rules">
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={6}>
                                <LBVLabel style={{fontSize: 13, color: "rgb(133, 133, 133)"}}>Description</LBVLabel>
                                <ReactQuill theme="snow" style={{ background: 'white' }} value={form.description}
                                    modules={{toolbar: toolbarOptions}}
                                    onChange={(e) => { onChange({description: e}) }}
                                />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <LBVLabel style={{fontSize: 13, color: "rgb(133, 133, 133)"}}>House Rules</LBVLabel>
                                <ReactQuill theme="snow" style={{ background: 'white' }} value={form.houseRules}
                                    modules={{toolbar: toolbarOptions}}
                                    onChange={(e) => { onChange({houseRules: e}) }}
                                />
                            </Grid>
                        </Grid>
                    </MainCard>
                </Grid>

                <Grid item xs={12}>
                    <MainCard
                        title="Rooms"
                        secondary={
                            <Button variant="contained" size="small" color="primary" onClick={addRoom}>
                                Add room
                            </Button>
                        }
                    >
                        {rooms.length === 0 && (
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                No rooms yet. A property needs at least one before guests can book it.
                            </Typography>
                        )}
                        <Rooms
                            rooms={rooms}
                            saveRoomInfo={saveRoomInfo}
                            changeRoomIndex={(e) => { setRooms([...e]) }}
                            deleteRoom={deleteRoom}
                            onRoomUploadingChange={setRoomPending}
                        />
                    </MainCard>
                </Grid>
            </Grid>

            {/* Sticky, because the form runs well past a screen once rooms are added and
                Save used to sit below all of them. */}
            <Paper
                elevation={3}
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                    mt: 2,
                    p: { xs: 1, sm: 1.5 },
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {missingFields.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 1, py: 0, fontSize: { xs: 12, sm: 14 } }}>
                        Needed before publishing: {missingFields.join(', ')}. You can still save a draft.
                    </Alert>
                )}

                {/* Row on every width, including phones. Stacked full-width buttons made
                    this bar 122px tall - 15% of a 375x812 screen, permanently occupied on
                    a form you are meant to be reading. */}
                <Stack direction="row" spacing={1} alignItems="center">
                    {/* Deliberately does not report saved/unsaved. `dirty` reads true on a
                        freshly loaded property that has rooms - something writes back into
                        `rooms` after markClean - so a "you have unsaved changes" label here
                        would be wrong on every load. Uploads and the autosave stamp are the
                        two signals that are reliable. */}
                    <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                        {uploadingCount > 0
                            ? `Waiting for ${uploadingCount} upload${uploadingCount > 1 ? 's' : ''} to finish`
                            : autoSavedAt
                                ? `Draft autosaved at ${autoSavedAt.toLocaleTimeString()}`
                                : ''}
                    </Typography>

                    <Button variant="outlined" color="primary"
                        sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { sm: 140 } }}
                        disabled={busy || uploadingCount > 0}
                        onClick={() => save('draft')}
                    >
                        {savingDraft ? <CircularProgress size={24} /> : "Save as Draft"}
                    </Button>

                    <Button variant="contained" color="primary"
                        sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { sm: 140 } }}
                        disabled={busy || uploadingCount > 0 || missingFields.length > 0}
                        onClick={() => save('published')}
                    >
                        {saving
                            ? <CircularProgress size={24} style={{color: 'white'}} />
                            : (isDraft || !id) ? "Publish" : "Save"}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    )
}

// The region/location/type fields hold a plain string straight after load and a
// { label, value } option once the select's list resolves. Both shapes have to
// produce the same id, or Save can post locationId: undefined during that window.
function optionValue(option, fallback) {
    if (option && typeof option === 'object') { return option.value }
    return fallback || null
}

function optionLabel(option) {
    if (option && typeof option === 'object') { return option.label }
    return option || null
}

// Cheap structural comparison for "has anything actually changed since the last
// save". Compares the same ids the payload carries, so the async resolution of a
// select does not register as an edit and trigger a pointless autosave.
function snapshotOf(form, rooms) {
    return JSON.stringify({
        name: form.name,
        propertyImage: form.propertyImages || [],
        regionId: optionValue(form.region, form.regionId),
        locationId: optionValue(form.location, form.locationId),
        type: optionValue(form.type, null),
        description: form.description,
        houseRules: form.houseRules,
        mapInfo: form.mapInfo,
        rooms: rooms.map(({ clientId: _ignored, ...room }) => room),
    })
}

// Accepts either a full <iframe ...> embed or a plain URL. The old version did
// value.split('src="')[1].split('" width="')[0] unguarded, so anything that was
// not a complete embed threw on every keystroke.
function extractMapUrl(value) {
    if (!value) { return '' }
    const match = value.match(/src="([^"]+)"/)
    return match ? match[1] : value
}

export default AddPlaces
