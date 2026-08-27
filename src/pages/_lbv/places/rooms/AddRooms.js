import React, { useCallback, useEffect, useRef, useState } from "react";
import { LBVInput } from "../../../../components/_lbvcomponents/LBVInput";
import { Card, Grid, FormControlLabel, Checkbox } from "@mui/material";
import RoomsPrice from "./RoomsPrice";
import { NumericFormat } from "react-number-format";
import { LBVLabel, LBVTitleLabel } from "../../../../components/_lbvcomponents/LBVLabel";
import RoomsSchedule from "./RoomsSchedule";
import RoomsAmenities from "./RoomsAmenities";
import ImageUploader from "components/_lbvcomponents/ImageUploader";

import DeleteIcon from '@mui/icons-material/Delete';
import LBVAccordion from "components/_lbvcomponents/LBVAccordion";

function AddRooms ({
    index,
    saveRoomInfo,
    deleteRoom,
    data,
    onUploadingChange
}) {

    // `data.defaultPrice.nominal` never existed - AddPlaces builds defaultPrice as
    // { price, format }. So this read undefined, and because the effect below
    // spreads defaultPrice *over* form, simply opening a saved property and
    // pressing Save wiped every room's price back to 0.
    const [ defaultPrice, setDefaultPrice ] = useState({
        price: (data.defaultPrice && data.defaultPrice.price) || data.price || 0,
        format: (data.defaultPrice && data.defaultPrice.format) || ''
    })

    const [ form, setForm ] = useState({
        priceList: [],
        disabledDate: [],
        facilities: {
            swimmingPool: false,
            airportShuttle: false,
            restaurant: false,
            breakfast: false,
            freeParking: false
        },
        maximumGuest: {
            adult: null,
            child: null,
            total: null
        },
        roomSize: null,
        poolSize: null,
        roomImages: data.propertyImage || [],
        ...data
    })

    // Skip the write on mount. The parent is where `data` came from, so pushing it
    // straight back was redundant - and it made every freshly loaded property look
    // edited, which would have had autosave rewriting drafts nobody touched.
    const mountedRef = useRef(false)
    useEffect(() => {
        if (!mountedRef.current) { mountedRef.current = true; return }
        saveRoomInfo({
            ...form,
            ...defaultPrice
        }, index)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form, defaultPrice])

    const onChange = (e) => {
        setForm(prev => ({
            ...prev,
            ...e
        }))
    }

    const setPrice = (e) => {
        onChange({priceList: e})
    }

    const setRoomImages = useCallback((images) => {
        onChange({ roomImages: images })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Bubbles this room's in-flight upload count up so Save can be blocked while
    // anything is still going to S3.
    const handlePendingChange = useCallback((count) => {
        if (onUploadingChange) { onUploadingChange(data.clientId, count) }
    }, [onUploadingChange, data.clientId])

    // A deleted room must not leave its pending count behind, or Save stays
    // disabled forever.
    useEffect(() => () => {
        if (onUploadingChange) { onUploadingChange(data.clientId, 0) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Grid container xs={12} p={0}>
            <Grid item xs={12} onClick={() => {
                deleteRoom(index)
            }} textAlign={"right"} sx={{
                cursor: 'pointer'
            }}>
                <DeleteIcon sx={{color: 'red'}}/>
            </Grid>
            <Grid item xs={12}>
                <ImageUploader
                    uploadName={`addOnRoomImage-${index}`}
                    dirName="rooms"
                    title="Room Images"
                    value={form.roomImages || []}
                    onChange={setRoomImages}
                    onPendingChange={handlePendingChange}
                />
            </Grid>
            <Grid item container xs={12} md={6} spacing={1}>
                <Grid item xs={12} md={5}>
                    <LBVInput label={"Name"} value={form.name} onChange={(e) => {
                        onChange({
                            name: e.currentTarget.value
                        })
                    }} />
                </Grid>
                <Grid item xs={12} md={2}>
                    <LBVInput label={"Bed Room"} value={form.room} onChange={(e) => {
                        onChange({
                            room: e.currentTarget.value
                        })
                    }} />
                </Grid>
                {/* <Grid item xs={12}>
                    <LBVInput label={"Bed"} />
                </Grid> */}
                <Grid item xs={12} md={5}>
                    <LBVLabel>Default Price</LBVLabel>
                    <NumericFormat value={defaultPrice.format}
                        onValueChange={(values) => {
                            const {formattedValue, value, floatValue} = values;
                            // do something with floatValue
                            setDefaultPrice({ format: formattedValue.replace(/^0+/, ''), price: value.replace(/^0+/, '') })
                        }}
                        // disabled={form._id}
                        decimalScale={0}
                        allowLeadingZeros={false}
                        allowedDecimalSeparators={false}
                        allowNegative={false}
                        thousandSeparator
                        customInput={LBVInput}
                    />
                </Grid>
                <Grid item xs={12}>
                    <LBVLabel bold>Maximum capacity {form.maximumGuest.total ? `(${form.maximumGuest.total})` : ''}</LBVLabel>
                </Grid>
                <Grid item xs={6} md={3}>
                    <LBVInput label={"Adult"} value={form.maximumGuest.adult} onChange={(e) => {
                        if (Number(e.currentTarget.value) > 30) { return; }
                        setForm( prev => ({
                            ...prev,
                            maximumGuest: {
                                ...prev.maximumGuest,
                                adult: Number(e.currentTarget.value) || 0,
                                total: Number(e.currentTarget.value) + Number(form.maximumGuest.child || 0)
                            }
                        }))
                    }} />
                </Grid>
                <Grid item xs={6} md={3}>
                    <LBVInput label={"Child"} value={form.maximumGuest.child} onChange={(e) => {
                        if (Number(e.currentTarget.value) > 10) { return; }
                        setForm( prev => ({
                            ...prev,
                            maximumGuest: {
                                ...prev.maximumGuest,
                                child: Number(e.currentTarget.value) || 0,
                                total: Number(e.currentTarget.value) + Number(form.maximumGuest.adult || 0)
                            }
                        }))
                    }} />
                </Grid>
                <Grid item xs={12}>
                    <LBVLabel bold>Properties Info</LBVLabel>
                </Grid>
                <Grid item xs={6} md={3}>
                    <LBVInput label={"Size Room (Sqm)"} value={form.roomSize} onChange={(e) => {
                        onChange({
                            roomSize: e.currentTarget.value
                        })
                    }} />
                </Grid>
                <Grid item xs={6} md={3}>
                    <LBVInput label={"Size Pool (l x w)"} value={form.poolSize} onChange={(e) => {
                        onChange({
                            poolSize: e.currentTarget.value
                        })
                    }} />
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Card sx={{p: 2}}>
                    <LBVLabel style={{fontSize: 13, color: "rgb(133, 133, 133)"}}>Facilities</LBVLabel>
                    <FormControlLabel control={<Checkbox checked={form.facilities.breakfast} onChange={() => {
                        onChange({
                            facilities: {
                                ...form.facilities,
                                breakfast: !form.facilities.breakfast
                            }
                        })
                    }} />} label={
                        <LBVLabel>Breakfast</LBVLabel>
                    } />
                    {/* <FormControlLabel control={<Checkbox checked={form.facilities.restaurant} onChange={() => {
                        onChange({
                            facilities: {
                                ...form.facilities,
                                restaurant: !form.facilities.restaurant
                            }
                        })
                    }} />}  label={
                        <LBVLabel>Restaurant</LBVLabel>
                    } /> */}
                    <FormControlLabel control={<Checkbox checked={form.facilities.publicPool} onChange={() => {
                        onChange({
                            facilities: {
                                ...form.facilities,
                                publicPool: !form.facilities.publicPool
                            }
                        })
                    }} />} label={
                        <LBVLabel>Public Pool</LBVLabel>
                    } />
                    <FormControlLabel control={<Checkbox checked={form.facilities.privatePool} onChange={() => {
                        onChange({
                            facilities: {
                                ...form.facilities,
                                privatePool: !form.facilities.privatePool
                            }
                        })
                    }} />} label={
                        <LBVLabel>Private Pool</LBVLabel>
                    } />
                    <FormControlLabel control={<Checkbox checked={form.facilities.airportShuttle} onChange={() => {
                        onChange({
                            facilities: {
                                ...form.facilities,
                                airportShuttle: !form.facilities.airportShuttle
                            }
                        })
                    }} />} label={
                        <LBVLabel>Airport Shuttle</LBVLabel>
                    } />
                    <FormControlLabel control={<Checkbox checked={form.facilities.freeParking} onChange={() => {
                        onChange({
                            facilities: {
                                ...form.facilities,
                                freeParking: !form.facilities.freeParking
                            }
                        })
                    }} />} label={
                        <LBVLabel>Free Parking</LBVLabel>
                    } />
                </Card>
            </Grid>
            <Grid item xs={12}>
                <LBVAccordion title={
                    <LBVTitleLabel>{"Amenities"}</LBVTitleLabel>
                }>
                    <RoomsAmenities hideTitle={true} amenitiesList={form.amenities} setRoomAmenities={(e) => { 
                        onChange({amenities: e})
                    }} />
                </LBVAccordion>
            </Grid>
            <Grid item xs={12}>
                {/* informasi untuk price */}
                <LBVAccordion title={
                    <LBVTitleLabel>{"Special Price"}</LBVTitleLabel>
                }>
                    <RoomsPrice hideTitle={true} prices={form.priceList} setPrice={setPrice}/>
                </LBVAccordion>
            </Grid>
            <Grid item xs={12}>
                {/* informasi untuk price */}
                <LBVAccordion title={
                    <LBVTitleLabel>{"Disable Date"}</LBVTitleLabel>
                }>
                    <RoomsSchedule vertical={window.innerWidth < 1000} hideTitle={true} disabledDate={form.disabledDate} setDisableDay={(e) => { 
                        onChange({disabledDate: e})
                    }}/>
                </LBVAccordion>
            </Grid>
        </Grid>
    )
}

// Typing in one room used to re-render every other room, each of which mounts the
// full amenities grid and two calendar months. AddPlaces now updates `rooms`
// immutably, so untouched rooms keep object identity and memo can skip them.
export default React.memo(AddRooms)