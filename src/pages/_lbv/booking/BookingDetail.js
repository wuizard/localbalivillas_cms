import { Card, Grid, Icon } from "@mui/material";
import { LBVLabel, LBVTitleLabel } from "components/_lbvcomponents/LBVLabel";
import { color } from "helper/constant";
import React, { useEffect, useState } from "react";
import { getBooking } from "services/bookingService";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { currencyFormat } from "helper/numberHelper";
import moment from "moment";


function BookingDetail ({
    
}) {

    const [ bookingData, setBookingData ] = useState(null)

    useEffect(() => {
        let pathId = window.location.pathname.split('/')
        loadBookingDetail(pathId[pathId.length - 1])
    }, [])

    const loadBookingDetail = async (_id) => {
        let { data, error } = await getBooking(_id)
        if (error) { console.log(error) }
        if (data) { console.log(data)
            setBookingData(data)
        }
    }

    return (
        <Grid>
            {
                bookingData &&
                <Grid>
                    <Card>
                        <Grid container p={2}>
                            <LBVTitleLabel>{bookingData.bookingId}</LBVTitleLabel>
                            <Grid item xs={12}>
                                Booked by : {bookingData.guestInfo.name} <span><WhatsAppIcon sx={{ pt:0.3, fontSize: 14, color: color.green_whatsapp }}/><a style={{ color: color.green_whatsapp }} href={`https://wa.me/${bookingData.guestInfo.phoneNumber.replace('+', '')}`}>{bookingData.guestInfo.phoneNumber}</a></span>
                            </Grid>
                        </Grid>
                    </Card>
                    <Card sx={{marginTop: 1}}>
                        <Grid container p={2}>
                            <Grid item container xs={12} mb={2}>
                                <Grid item xs={12}>
                                    <LBVTitleLabel>{bookingData.propertiesInfo.roomName}</LBVTitleLabel>
                                </Grid>
                                <Grid item xs={12}>
                                    <LBVLabel>{bookingData.propertiesInfo.propertiesName}</LBVLabel>
                                </Grid>
                                <Grid item xs={12} lg={3} mt={1}>
                                    <img src={bookingData.propertiesInfo.placeImage[0]} width={'100%'} height={'auto'} style={{
                                        objectFit: 'fill'
                                    }}/>
                                </Grid>
                            </Grid>
                            <Grid item container xs={12} lg={2}>
                                <Grid item xs={12}>
                                    <LBVLabel subtitle>Check In Date</LBVLabel>
                                </Grid>
                                <Grid item xs={12}>
                                    <LBVLabel bold>{moment(bookingData.dates[0]).format('ddd DD/MM/YYYY')}</LBVLabel>
                                </Grid>
                            </Grid>
                            <Grid item container xs={12} lg={2}>
                                <Grid item xs={12}>
                                    <LBVLabel subtitle>Check Out Date</LBVLabel>
                                </Grid>
                                <Grid item xs={12}>
                                    <LBVLabel bold>{moment(bookingData.dates[bookingData.dates.length - 1]).format('ddd DD/MM/YYYY')}</LBVLabel>
                                </Grid>
                            </Grid>
                            <Grid item container xs={12} lg={2}>
                                <Grid item xs={12}>
                                    <LBVLabel subtitle>Guest Info</LBVLabel>
                                </Grid>
                                <Grid item xs={12}>
                                    <LBVLabel bold>{`${bookingData.guestInfo.adult} Adult • ${bookingData.guestInfo.kids} Children`}{bookingData.guestInfo.kids > 0 ? ` (Age : ${bookingData.guestInfo.childrenAge})` : ``}</LBVLabel>
                                </Grid>
                            </Grid>
                            <Grid item container xs={12} lg={2}>
                                <Grid item xs={12}>
                                    <LBVLabel subtitle>Room</LBVLabel>
                                </Grid>
                                <Grid item xs={12}>
                                    <LBVLabel bold>{bookingData.totalRooms}</LBVLabel>
                                </Grid>
                            </Grid>
                            <Grid item container xs={12} lg={2}>
                                <Grid item xs={12}>
                                    <LBVLabel subtitle>Arrival Time</LBVLabel>
                                </Grid>
                                <Grid item xs={12}>
                                    <LBVLabel bold>{bookingData.arrivalTime}</LBVLabel>
                                </Grid>
                            </Grid>
                            <Grid item container xs={12} lg={12}>
                                <Grid item xs={12}>
                                    <LBVLabel subtitle>Special Request</LBVLabel>
                                </Grid>
                                <Grid item xs={12}>
                                    <LBVLabel bold>{bookingData.specialRequest}</LBVLabel>
                                </Grid>
                            </Grid>
                            <Grid item container xs={12} mt={2}>
                                {
                                    bookingData.voucherInfo &&
                                    <Grid item xs={12} mb={1}>
                                        <LBVTitleLabel style={{ fontSize: 15, fontWeight: 'bold'}}>{bookingData.voucherInfo.voucherCode} (-{
                                            bookingData.voucherInfo.discountType == "nominal" ? `${currencyFormat(bookingData.voucherInfo.nominal)}${bookingData.voucherInfo.couponUsage == 'night' ? ` /night(s)` : ''}` : `${bookingData.voucherInfo.nominal}%${bookingData.voucherInfo.couponUsage == 'night' ? ` /night(s)` : ''}`
                                        })</LBVTitleLabel>
                                        <LBVTitleLabel style={{ fontSize: 15, textDecoration: 'line-through' }}>{currencyFormat(bookingData.subtotal)}</LBVTitleLabel>
                                    </Grid>
                                    
                                }
                                <Grid item xs={12}>
                                    <LBVLabel>Total</LBVLabel>
                                </Grid>
                                <Grid item xs={12}>
                                    <LBVTitleLabel>{currencyFormat(bookingData.totalPrice)}</LBVTitleLabel>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <LBVLabel>{bookingData.lastStatus}</LBVLabel>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            }
        </Grid>
    )
}

export default BookingDetail