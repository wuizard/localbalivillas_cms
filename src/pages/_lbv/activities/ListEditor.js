import React, { useState } from "react";
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import MainCard from "components/MainCard";
import { LBVInput } from "components/_lbvcomponents/LBVInput";

/**
 * A repeater for the plain string lists an activity carries - highlights,
 * inclusions, exclusions, what to bring. One component rather than four copies of
 * the same add/remove wiring.
 *
 * Each one is a card so the four line up: only some of them carry a hint, and
 * without a frame that one extra line of text pushed its field out of step with
 * the card beside it.
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
        <MainCard
            // The title is rendered in the content rather than passed as `title`:
            // MainCard's header padding plus CardContent's own left a 36px gap under
            // the heading. Here the heading and its hint are one block, so the gap
            // between them is 4px and the column gap only applies between blocks.
            content={false}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 2.5 }}>
                <div>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography variant="subtitle1">{title}</Typography>
                        {items.length > 0 && (
                            <Chip size="small" label={items.length}
                                sx={{ bgcolor: 'primary.lighter', color: 'primary.darker', fontWeight: 600 }} />
                        )}
                    </Stack>
                    {hint ? (
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                            {hint}
                        </Typography>
                    ) : null}
                </div>

                {items.length > 0 ? (
                    <Stack spacing={1}>
                        {items.map((item, index) => (
                            <Stack
                                key={`${item}-${index}`}
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    border: 1, borderColor: 'divider', borderRadius: 1,
                                    pl: 1.5, pr: 0.5, py: 0.5
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}
                                >
                                    {item}
                                </Typography>
                                <Tooltip title="Remove">
                                    <IconButton size="small" color="error" onClick={() => removeAt(index)}>
                                        <DeleteOutlined />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        Nothing added yet.
                    </Typography>
                )}

                {/* On a phone the button beside the field leaves it about 190px wide, which
                    is not enough to read back a line you are typing — so stack there and
                    give the field the full row. sm and up keeps them side by side, bottom
                    aligned because LBVInput renders its (here empty) label row as a sibling
                    of the field. */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'stretch', sm: 'flex-end' }}
                    sx={{ mt: 'auto', pt: 0.5 }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* LBVInput hands back the raw event, and `enterAction` is its own
                            hook for the Enter key — so a line can be added without reaching
                            for the form's submit. */}
                        <LBVInput
                            value={draft}
                            placeHolder={placeholder}
                            onChange={(e) => setDraft(e.currentTarget.value)}
                            enterAction={add}
                        />
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<PlusOutlined />}
                        onClick={add}
                        sx={{ flexShrink: 0, height: 40, width: { xs: '100%', sm: 'auto' } }}
                    >
                        Add
                    </Button>
                </Stack>
            </Box>
        </MainCard>
    )
}

export default ListEditor;
