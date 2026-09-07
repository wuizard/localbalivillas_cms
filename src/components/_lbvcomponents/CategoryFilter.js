import React from "react"
import PropTypes from "prop-types"
import { Chip, Skeleton, Stack } from "@mui/material"

// ==============================|| CATEGORY FILTER - CHIP ROW ||============================== //

/**
 * One row of category chips, with "All" first. It scrolls sideways rather than
 * wrapping, so the filter stays one line tall on a phone and the row never
 * pushes the content below it down as categories are added.
 */
function CategoryFilter ({
    categories = [],
    value = '',
    onChange,
    counts = null,
    loading = false,
    allLabel = 'All'
}) {

    const chipSx = (selected) => ({
        borderRadius: 5,
        fontWeight: 500,
        px: 0.5,
        cursor: 'pointer',
        ...(selected
            ? { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }
            : { bgcolor: 'transparent', color: 'text.secondary', border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'primary.lighter', color: 'primary.main' } })
    })

    const labelWithCount = (label, slug) => {
        if (!counts) { return label }
        return `${label} (${slug === '' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[slug] || 0)})`
    }

    if (loading) {
        return (
            <Stack direction="row" spacing={1} sx={{ px: 2.5, pb: 2 }}>
                {[0, 1, 2, 3].map(item => <Skeleton key={item} width={92} height={32} sx={{ borderRadius: 5 }} />)}
            </Stack>
        )
    }

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                px: 2.5,
                pb: 2,
                overflowX: 'auto',
                flexWrap: 'nowrap',
                // The scrollbar itself is noise on a filter row - the chips
                // bleeding off the edge is enough of a hint that it moves.
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                '& .MuiChip-root': { flexShrink: 0 }
            }}
        >
            <Chip
                label={labelWithCount(allLabel, '')}
                onClick={() => onChange('')}
                sx={chipSx(value === '')}
            />
            {categories.map(category => (
                <Chip
                    key={category.slug}
                    label={labelWithCount(category.name, category.slug)}
                    onClick={() => onChange(category.slug)}
                    sx={chipSx(value === category.slug)}
                />
            ))}
        </Stack>
    )
}

CategoryFilter.propTypes = {
    categories: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    counts: PropTypes.object,
    loading: PropTypes.bool,
    allLabel: PropTypes.string
}

export default CategoryFilter
