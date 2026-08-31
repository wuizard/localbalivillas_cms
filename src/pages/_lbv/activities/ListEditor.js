import React, { useState } from "react";
import { Button, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { LBVInput } from "components/_lbvcomponents/LBVInput";
import { LBVLabel } from "components/_lbvcomponents/LBVLabel";

/**
 * A repeater for the plain string lists an activity carries - highlights,
 * inclusions, exclusions, what to bring. One component rather than four copies of
 * the same add/remove wiring.
 */
function ListEditor({ title, hint, placeholder, value = [], onChange }) {
    const [draft, setDraft] = useState("")

    const items = Array.isArray(value) ? value : []

    const add = () => {
        const trimmed = draft.trim()
        if (!trimmed) { return }
        onChange([...items, trimmed])
        setDraft("")
    }

    const removeAt = (index) => {
        onChange(items.filter((_, i) => i !== index))
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <LBVLabel>{title}</LBVLabel>
                {hint ? (
                    <Typography variant="caption" color="textSecondary" display="block">
                        {hint}
                    </Typography>
                ) : null}
            </Grid>

            {items.map((item, index) => (
                <Grid item xs={12} key={`${item}-${index}`}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" sx={{ flex: 1 }}>{item}</Typography>
                        <Tooltip title="Remove">
                            <IconButton size="small" color="error" onClick={() => removeAt(index)}>
                                <DeleteOutlined />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Grid>
            ))}

            <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="center">
                    {/* LBVInput hands back the raw event, and `enterAction` is its own
                        hook for the Enter key — so a line can be added without reaching
                        for the form's submit. */}
                    <LBVInput
                        value={draft}
                        placeHolder={placeholder}
                        styles={{ width: '100%' }}
                        onChange={(e) => setDraft(e.currentTarget.value)}
                        enterAction={add}
                    />
                    <Button variant="outlined" startIcon={<PlusOutlined />} onClick={add}>
                        Add
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    )
}

export default ListEditor;
