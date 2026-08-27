import React, { useEffect, useState } from "react";

import { DateRangePicker } from 'react-date-range';
import { format } from "date-fns";

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import moment from "moment";

function LBVCalendar ({
    onChange, vertical = false, price, month = 2, dates
}) {
    
    const [ orientation, setOrientation ] = useState("horizontal")
    const [ calendarState, setCalendarState ] = useState([
        {
            startDate : null,
            endDate : new Date(""),
            key : 'selection',
            color: '#d0d6dd'
        }
    ]);
    const [ focusedRange, setFocusedRange ] = useState([0,0])

    useEffect(() => {
        if (vertical) { setOrientation("vertical") }
    }, [vertical])

    useEffect(() => {
        if (dates && dates.length > 0) {
            // map the dates
            let newDates = []
            for (let i = 0; i < dates.length; i ++) {
                console.log('here check dates', dates[i])
                if (moment(dates[i]) >= moment(new Date())) {
                    newDates.push(dates[i])
                }
            }
            if (newDates.length > 0) { setDateRange(newDates) }
        }
    }, [])

    useEffect(() => {
        let dates = []
        for (let i = 0; i < calendarState.length; i ++) {
            if (moment(calendarState[i].startDate).format('YYYY-MM-DD') === moment(calendarState[i].endDate).format('YYYY-MM-DD')) {
                if (calendarState[i].isSelect == false) { continue; }
            }
            let { startDate, endDate } = calendarState[i]
            let days = calculateDays({startDate: startDate, endDate: endDate})
            dates = dates.concat(days.filter((item) => dates.indexOf(item) < 0))
        }
        dates.sort()
        console.log('here check information', dates)
        onChange(dates)
    }, [calendarState])

    useEffect(() => {
        console.log('here check information -focused range', focusedRange)
    }, [focusedRange])

    const onChangeCalendarSelection = (e) => {
        console.log('here check information', e)
        if (moment(e.selection.startDate).format('YYYY-MM-DD') == moment(e.selection.endDate).format('YYYY-MM-DD')) {
            if (e.selection.isSelect == true) { 
                console.log('here check information true condition', focusedRange)
                setFocusedRange([0,0]);
            }
        }
        let checkCalendar = checkCalendarRange(e.selection)
        if (!checkCalendar) { return; }
        let { newCalendarState } = checkCalendar
        // setCalendarState(() => ([...newCalendarState]))
        setCalendarState([...newCalendarState])
    }

    const setDateRange = (e) => {
        let newInfo = []
        for (let i = 0 ; i < e.length; i ++) {
            if (i == 0) {
                newInfo.push({
                    startDate: new Date(e[i]),
                    endDate: null,
                    key: `selection`,
                    color: '#73818f'
                })
            } else {
                if (moment(e[i]).diff(e[i-1], 'days') > 1) {
                    newInfo[newInfo.length - 1].endDate = new Date(e[i-1])
                    newInfo.push({
                        startDate: new Date(e[i]),
                        endDate: (i == e.length - 1) ? new Date(e[i]) : null,
                        key: `selection`,
                        color: '#73818f'
                    })
                } else if (i == e.length - 1) {
                    newInfo[newInfo.length - 1].endDate = new Date(e[i])
                }
            }
        }
        setCalendarState([...newInfo])
    }

    const checkCalendarRange = (e) => {
        try { 
            if (!e) { return null }
            let newCalendarState = []
            let isInRange = false
            for (let i = 0; i < calendarState.length; i ++) {
                let currState = calendarState[i]
                if (!currState.startDate) { continue; }
                // if (moment(calendarState[i].startDate).format('YYYY-MM-DD') == moment(calendarState[i].endDate).format('YYYY-MM-DD')) { continue; }
                if (isDateInRange(currState.startDate, currState.endDate, e.startDate)
                    && isDateInRange(currState.startDate, currState.endDate, e.endDate)) {
                    isInRange = true
                    let calendarStateObj = {
                        startDate: e.startDate,
                        endDate: e.endDate,
                        key : 'selection',
                        color: '#73818f'
                    }
                    if (moment(e.startDate).format('YYYY-MM-DD') 
                        == moment(e.endDate).format('YYYY-MM-DD')) { 
                            calendarStateObj = {
                                ...calendarStateObj,
                                isSelect: (currState.isSelect == false || currState.isSelect == true) ? false : true,
                                color: (currState.isSelect == false || currState.isSelect == true) ? '#d0d6dd' : '#73818f'
                            }
                    }
                    if (calendarStateObj.isSelect == false) { continue; }
                    newCalendarState.unshift(calendarStateObj)
                } else if (isDateInRange(currState.startDate, currState.endDate, e.startDate)
                    || isDateInRange(currState.startDate, currState.endDate, e.endDate)
                ) {
                    isInRange = true
                    let calendarStateObj = {
                        startDate: e.startDate,
                        endDate: e.endDate,
                        key : 'selection',
                        color: '#73818f'
                    }
                    if (moment(e.startDate).format('YYYY-MM-DD') 
                        == moment(e.endDate).format('YYYY-MM-DD')) { 
                            calendarStateObj = {
                                ...calendarStateObj,
                                color: '#d0d6dd',
                                isSelect: false
                            }
                    }
                    newCalendarState.unshift(calendarStateObj)
                } else {
                    if (currState.isSelect == false) { continue; }
                    newCalendarState.push({
                        startDate: currState.startDate,
                        endDate: currState.endDate,
                        key : 'selection',
                        color: '#73818f'
                    })
                }
            }
            if (!isInRange) { 
                newCalendarState.unshift({
                    startDate: e.startDate,
                    endDate: e.endDate,
                    key : 'selection',
                    color: '#73818f'
                })
            }
            return { newCalendarState }
        } catch (error) {
            console.log(error)
        }
    }

    const isDateInRange = (startDate, endDate, dateToCheck) => {
        dateToCheck = moment(dateToCheck).format('YYYY-MM-DD')
        return dateToCheck >= moment(startDate).format('YYYY-MM-DD') && dateToCheck <= moment(endDate).format('YYYY-MM-DD')
    }

    function customDayContent(day) {
        let priceInfo = null;
        if (price) {
            let priceValue = 0
            for (let i = 0; i < price.length; i ++) {
                if (!price[i].date && !price[i].day) {
                    priceValue = price[i].price
                }
                if (price[i].day && price[i].day.indexOf(format(day, "eeee")) >= 0) {
                    priceValue = price[i].price
                }
                if (price[i].date && price[i].date.indexOf(format(day, "yyyy-MM-dd")) >= 0) {
                    priceValue = price[i].price
                }
            }
            priceInfo = (
                <div
                    className="rdrPriceInfo"
                    style={{
                        height: '10px',
                        // width: "5px",
                        borderRadius: "100%",
                        // background: "orange",
                        position: "absolute",
                        top: 14,
                        right: 0,
                        left: 0,
                        fontSize: 10,
                        textAlign: 'center',
                        color: '#a2a2a2'
                    }}
                >{priceValue}</div>
            )
        }
        return (
          <div>
            <span>{format(day, "d")}</span>
            {priceInfo}
          </div>
        )
    }

    return (
        <DateRangePicker
            minDate={new Date()}
            months={month}
            showPreview={true}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            retainEndDateOnFirstSelection={false}
            // rangeColors={rangeColors}
            ranges={calendarState}
            onChange={onChangeCalendarSelection}
            direction={orientation}
            dayContentRenderer={customDayContent}
            preventSnapRefocus={true}
            focusedRange={focusedRange}
            onRangeFocusChange={(e) => {
                if (moment(calendarState[0].startDate).format('YYYY-MM-DD') 
                    == moment(calendarState[0].endDate).format('YYYY-MM-DD')) {
                        if (calendarState[0].isSelect == true) { 
                            setFocusedRange([0,0]);
                            return;
                        }
                }
                setFocusedRange([0,e[1]])
            }}
            // disabledDates={[ new Date(), "2024-10-14" ]}
        />
    )
}

function calculateDays({
    startDate,
    endDate
}){
    let range = moment(endDate) - moment(startDate)
    let dateRange = Math.round(range / (1000 * 3600 * 24))
    console.log(dateRange, startDate, endDate)
    let days = []
    for (let i = 0; i <= dateRange; i ++) {
        days.push(moment(startDate).add(i, 'day').format('YYYY-MM-DD'))
    }
    console.log('here days', days)
    return days
}


export default LBVCalendar