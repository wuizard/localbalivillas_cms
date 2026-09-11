import React from "react"
import { LBVLabel } from "./LBVLabel"
import { Grid, TextField } from "@mui/material"
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

function LBVInput ({
    styles,
    label,
    disabled = false,
    value,
    defaultValue,
    type,
    rows,
    maxRows,
    fullWidth = true,
    placeHolder = "",
    onChange,
    onInput,
    showInfo,
    showAlert,
    autoFocus = false,
    inputProps,
    enterAction,
    selectedDate = null,
    monthsShown = 2
}) {

    const InputProps = {
      ...inputProps
      // inputProps: { min: "2020-05-01", max: "2020-05-04"} 
    }

    return (
        <>
            <Grid container alignItems={'flex-end'} spacing={1}>
              <Grid item>
                <LBVLabel style={{fontSize: 13, color: "rgb(133, 133, 133)"}}>{label}</LBVLabel>
              </Grid>
              <Grid item sx={{pt:'0px !important', pl: '2px !important'}}>
                {showAlert && <LBVLabel style={{fontSize: 11, color: '#f44336'}}>{showAlert}</LBVLabel>}
              </Grid>
            </Grid>
            {
              type == "date" ?
              <DatePicker
                value={value}
                selected={selectedDate}
                onChange={(date) => {
                  onChange(moment(date).format('YYYY-MM-DD'))
                }}
                monthsShown={monthsShown}
                placeholderText="Select date"
                style={{ width: '100%' }}
                popperProps={{ strategy: "fixed" }}
                popperPlacement="bottom"
                popperModifiers={{
                  preventOverflow: {
                    enabled: true,
                  },
                }}
                withPortal={window.innerWidth < 1000}
                customInput={
                  <TextField fullWidth={true} 
                    disabled={disabled} value={selectedDate} defaultValue={selectedDate} 
                    sx={{...LBVInputStyle, ...styles}} 
                    { ...InputProps }
                  />
                }
              />
              :
              <TextField placeholder={placeHolder} fullWidth={fullWidth} multiline={type == "textarea"}
                type={type} rows={rows} maxRows={maxRows} onInput={onInput}
                disabled={disabled} value={value} defaultValue={defaultValue}
                onWheel={(e) => {
                  if (type === 'number' && e.target && typeof e.target.blur === 'function') {
                    e.target.blur()
                  }
                }}
                onKeyDown={(e) => {
                  if (type === 'number' && e.code === 'Minus') {
                      e.preventDefault();
                  }
                  if(e.key == 'Enter') {
                    if (enterAction) {
                        enterAction()
                    }
                }
                }}
                onChange={onChange}
                sx={{...LBVInputStyle, ...styles}} 
                { ...InputProps }
              />
            }
            {showInfo &&  <LBVLabel style={{fontSize: 11, color: '#1e88e5'}}>{showInfo}</LBVLabel>}
        </>
    )
}

function LBVSelect ({
  styles,
  label,
  disabled = false,
  value,
  defaultValue,
  type,
  rows,
  maxRows,
  fullWidth = true,
  placeHolder,
  onChange,
  options = [],
  showAlert = null,
  showInfo = null,
  isMulti = false
}) {
  return (
    <>
      {/* <TCLabel style={{fontSize: 13}}>{label}</TCLabel> */}
      <Grid container alig alignItems={'flex-end'} spacing={1}>
        <Grid item>
          <LBVLabel style={{fontSize: 13, color: "rgb(133, 133, 133)"}}>{label}</LBVLabel>
        </Grid>
        <Grid item sx={{pt:'0px !important', pl: '2px !important'}}>
          {showAlert && <LBVLabel style={{fontSize: 11, color: '#f44336'}}>{showAlert}</LBVLabel>}          
        </Grid>
      </Grid>
      <Select
        menuPortalTarget={document.body} 
        placeholder={placeHolder}
        options={options}
        value={value}
        defaultValue={defaultValue}
        isMulti={isMulti}
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
          ...LBVSelectStyle,
          ...styles,
        }}
        isDisabled={disabled}
        onChange={onChange}
      />
      {showInfo &&  <LBVLabel style={{fontSize: 11, color: '#1e88e5'}}>{showInfo}</LBVLabel>}
    </>
  )
}

function LBVCreateableSelect ({
  styles,
  label,
  disabled = false,
  value,
  defaultValue,
  type,
  rows,
  maxRows,
  fullWidth = true,
  placeHolder,
  onChange,
  options = [],
  showAlert = null,
  showInfo = null,
  isMulti = false
}) {
  return (
    <>
      {/* <TCLabel style={{fontSize: 13}}>{label}</TCLabel> */}
      <Grid container alig alignItems={'flex-end'} spacing={1}>
        <Grid item>
          <LBVLabel style={{fontSize: 13, color: "rgb(133, 133, 133)"}}>{label}</LBVLabel>
        </Grid>
        <Grid item sx={{pt:'0px !important', pl: '2px !important'}}>
          {showAlert && <LBVLabel style={{fontSize: 11, color: '#f44336'}}>{showAlert}</LBVLabel>}          
        </Grid>
      </Grid>
      <CreatableSelect
        menuPortalTarget={document.body} 
        placeholder={placeHolder}
        options={options}
        value={value}
        defaultValue={defaultValue}
        isMulti={isMulti}
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
          ...LBVSelectStyle,
          ...styles,
        }}
        isDisabled={disabled}
        onChange={onChange}
      />
      {showInfo &&  <LBVLabel style={{fontSize: 11, color: '#1e88e5'}}>{showInfo}</LBVLabel>}
    </>
  )
}

export const LBVSelectStyle = {
  control: (baseStyles, {isDisabled}) => ({
    ...baseStyles,
    // borderColor: "#344767",
    fontSize: '13px',
    border: '0.5px solid #2196f366',
    // backgroundColor: '#f8fafc',
    borderColor: "#2196f3",
    backgroundColor: isDisabled ? "#f5f5f5" : "#ffffff",
    borderRadius: 8,
    "&:hover": {
      borderColor: "#2196f3"
    },
  }),
  option: (base) => ({
    ...base,
    fontSize: '13px',
    height: '100%',
  }),
  menuPortal: base => ({
    ...base,
    fontSize: '13px'
  }),
  menuList: (base) => ({
    ...base,
    fontSize: '13px',
  })
}

export const LBVInputStyle = {
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: "#2196f3", // #d8f0e9 #64a591
    },
    "&:hover fieldset": {
      borderColor: '#2196f3',
    },
    "&.Mui-disabled input": {
      backgroundColor: "#f5f5f5"
    }
  },
  input: {
      border: "none",
      margin: 0,
      padding: 1,
      borderRadius: 2,
      borderColor: "#64a591",
      // backgroundColor: "#f5f5f5",
      backgroundColor: "#ffffff",
      // backgroundColor: '#d8f0e9',
      fontSize: '13px',
      fontWeight: 10,
      height: 22
  },
  textarea: {
    backgroundColor: "#ffffff",
    fontWeight: 10,
    margin: 0,
    padding: 1,  
  },
  "& fieldset": { border: '0.5px solid #2196f366', borderRadius: 2, },
}

export { LBVInput, LBVSelect, LBVCreateableSelect }