import React from "react"
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { LBVLabel } from "./LBVLabel";

function LBVAccordion ({
    id,
    ariaControls,
    title,
    children,
    outsideFunction = null
}) {
    return (
        <Accordion disableGutters onChange={(e,expanded) => {
            if(outsideFunction){ outsideFunction(id || 'open', expanded) }
          }}>
            <AccordionSummary
                sx={{
                    margin: 0,
                    minHeight: 0
                }}
                expandIcon={<ArrowDropDownIcon onClick={() => {
                    if (outsideFunction) { outsideFunction() }
                }} />}
                aria-controls={ariaControls}
                id={id}
            >
                <LBVLabel>{title}</LBVLabel>
            </AccordionSummary>
            <AccordionDetails>
                {children && children}
            </AccordionDetails>
        </Accordion>
    )
}

export default LBVAccordion