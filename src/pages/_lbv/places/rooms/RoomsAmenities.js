import React, { useEffect, useState } from "react"
import { Card, Grid, Button } from "@mui/material"
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel"
import { LBVInput } from "components/_lbvcomponents/LBVInput"
import { amenitiesData } from "helper/amenities"

// list of amenities

function RoomsAmenities ({
    amenitiesList,
    hideTitle,
    setRoomAmenities
}) {

    const [ amenities, setAmenities ] = useState(amenitiesList ? amenitiesList : [])
    const [ form, setForm ] = useState("")

    useEffect(() => {
        console.log('here amenities list', amenities)
        setRoomAmenities(amenities)
    }, [amenities])

    return (
        <Grid>
            {!hideTitle && <LBVTitleLabel mb={1} >Room Amenities</LBVTitleLabel>}
            {/* <Grid item container spacing={1}>
                <Grid item xs={6} md={2}>
                    <LBVInput value={form} placeHolder="Amenities" onChange={(e) => {
                        setForm(e.currentTarget.value)
                    }}/>
                </Grid>
                <Grid item xs={6} md={2}>
                    <Button color="primary" variant="contained" onClick={() => {
                        let amenitiesList = amenities
                        console.log('form to push', form)
                        amenitiesList.push(form)
                        setAmenities([...amenitiesList])
                        setForm("")
                    }}>Add</Button>
                </Grid>
            </Grid> */}
            <Grid container xs={12} spacing={2}>
                {
                    amenitiesData.map( (value, index) => {
                        return (
                            <Grid item container xs={12} md={4} justifyContent={"flex-start"} alignContent={"flex-start"} alignItems={"baseline"}>
                                <Grid item mb={0.5}>
                                    <LBVLabel style={{
                                        fontWeight: 500
                                    }}>{value.category}</LBVLabel>
                                </Grid>
                                <Grid item container xs={12} alignContent={"flex-start"} alignItems={"flex-start"} spacing={0.5}>
                                    {
                                        value.amenities.map( (v, index) => {
                                            return (
                                                <Grid item>
                                                    <Grid container p={0.5} sx={{
                                                        border: 'solid 1px #64a591',
                                                        borderRadius: 2,
                                                        fontSize: 11,
                                                        cursor: 'pointer',
                                                        backgroundColor: amenities.indexOf(v.name) >= 0 ? '#64a59180' : '',
                                                    }} justifyItems={"center"} alignItems={"center"}
                                                    onClick={() => {
                                                        let dataAmenities = amenities
                                                        let index = dataAmenities.indexOf(v.name)
                                                        console.log(dataAmenities, index)
                                                        if (index >= 0) {
                                                            dataAmenities.splice(index, 1)
                                                        } else {
                                                            dataAmenities.push(v.name)
                                                        }
                                                        console.log(dataAmenities)
                                                        setAmenities([...dataAmenities])
                                                    }}
                                                    >
                                                        {v.icon && <img src={v.icon} width={12} height={12} style={{marginRight: 2}}/>}
                                                        {v.name}
                                                    </Grid>
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid>
                            </Grid>
                        )
                    })
                }
            </Grid>
            {/* <Grid container mt={1}>
                {
                    amenities.map( (value, index) => {
                        return (
                            <Grid item xs={6} md={3}>
                                <Card>
                                    <Grid container p={1}>
                                        <Grid item xs>{value}</Grid>
                                        <Grid item xs={1} onClick={() => {
                                                console.log('hello world', amenities)
                                                const amenitiesList = amenities
                                                amenitiesList.splice(index, 1)
                                                setAmenities([...amenitiesList])
                                            }}
                                            style={{cursor: 'pointer'}}
                                        >x</Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                        )
                    })
                }
            </Grid> */}
        </Grid>
    )
}

export default RoomsAmenities