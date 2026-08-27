import React from "react"
import { Grid } from "@mui/material"
import { LBVLabel } from "./LBVLabel"

function DialogHeader ({
    title,
    closeDialog
}) {
    return (
        <Grid item xs={12} container pb={1} alignItems={"center"} >
            <Grid xs={11} item>
                {/* <TCTitleLabel>{title}</TCTitleLabel> */}
                <LBVLabel bold style={{
                    fontSize: 15
                }}>{title}</LBVLabel>
            </Grid>
            <Grid xs={1} item textAlign={"right"} style={{
                cursor: 'pointer'
            }}>
                <span onClick={closeDialog}>
                    {/* <LBVLabel bold style={{color: color.blueIndoor_2}}>X</LBVLabel> */}
                    <LBVLabel bold>X</LBVLabel>
                </span>
            </Grid>
        </Grid>
    )
}

export default DialogHeader