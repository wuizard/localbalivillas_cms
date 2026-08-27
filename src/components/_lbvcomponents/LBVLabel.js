import React from "react"
import { Typography } from "@mui/material"

function LBVTitleLabel ({
    variant,
    children,
    style
}) {
    const styles  = {
        fontSize: 20, fontWeight: 30,
        ...style,
    }
    return (
        <Typography variant={variant} color={"dark"}
            style={{...styles}}>
            {children}
        </Typography>
    )
}

function LBVLabel ({
    variant,
    children,
    style,
    subtitle = false,
    bold = false,
    inheritColor = false,
    onClick = () => {}
}) {
    const styles  = {
        // fontSize: 14, fontWeight: 30,
        fontSize: subtitle ? 11 : 13, fontWeight: bold ? 500 : 400,
        ...style,
    }
    return (
        <Typography variant={variant} style={{...styles}} onClick={onClick}>
            {children}
        </Typography>
    )
}

export {
    LBVLabel,
    LBVTitleLabel
}