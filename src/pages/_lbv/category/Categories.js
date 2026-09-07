import React, { useEffect, useState } from "react"

import {
    Box,
    Button,
    Chip,
    Dialog,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material"
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { toast } from "react-toastify"

import MainCard from "components/MainCard"
import { LBVInput } from "components/_lbvcomponents/LBVInput"
import {
    createCategory,
    deleteCategory,
    getCategories,
    reorderCategories,
    updateCategory
} from "services/categoryService"

const emptyForm = () => ({
    _id: null,
    name: '',
    slug: '',
    description: '',
    isActive: true
})

// Mirrors the backend's slugify so the form can preview the value before saving.
const previewSlug = (name) => String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

function Categories () {

    const [ form, setForm ] = useState(emptyForm())
    const [ rows, setRows ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ saving, setSaving ] = useState(false)
    const [ deleteDialog, setDeleteDialog ] = useState({ open: false, category: null })

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setLoading(true)
        let { data, error } = await getCategories({})
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setRows(data) }
    }

    const onChange = (e) => {
        setForm(prev => ({
            ...prev,
            ...e
        }))
    }

    const saveCategory = async () => {
        setSaving(true)
        let isEdit = !!form._id
        let { data, error } = isEdit
            ? await updateCategory({
                _id: form._id,
                name: form.name,
                description: form.description,
                isActive: form.isActive
            })
            : await createCategory({
                name: form.name,
                description: form.description,
                isActive: form.isActive
            })
        setSaving(false)
        if (error) { toast.error(error) }
        if (data) {
            const moved = data.movedActivities || 0
            toast.success(isEdit
                ? (moved ? `Category updated - ${moved} activit${moved === 1 ? 'y' : 'ies'} moved to the new url` : "Category updated")
                : "Category created")
            setForm(emptyForm())
            loadCategories()
        }
    }

    // The switch writes straight through - it is the one-click way to take a
    // category off the website without deleting anything.
    const toggleActive = async (category) => {
        let { data, error } = await updateCategory({ _id: category._id, isActive: !category.isActive })
        if (error) { toast.error(error) }
        if (data) { loadCategories() }
    }

    const move = async (index, direction) => {
        let next = index + direction
        if (next < 0 || next >= rows.length) { return }
        let ordered = [...rows]
        let [moved] = ordered.splice(index, 1)
        ordered.splice(next, 0, moved)
        // Optimistic: the row jumps immediately, the request just persists it.
        setRows(ordered)
        let { error } = await reorderCategories(ordered.map(category => category._id))
        if (error) { toast.error(error); loadCategories() }
    }

    const removeCategory = async () => {
        let category = deleteDialog.category
        setDeleteDialog({ open: false, category: null })
        let { data, error } = await deleteCategory(category._id)
        if (error) { toast.error(error) }
        if (data) { toast.success("Category deleted"); loadCategories() }
    }

    const isEditing = !!form._id
    // A rename rewrites the slug, so the form says so before it happens rather
    // than leaving someone to notice the public url moved.
    const slugChanging = isEditing && previewSlug(form.name) !== form.slug
    const editingUsage = isEditing
        ? (rows.find(category => category._id === form._id) || {}).activityCount || 0
        : 0

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">Categories</Typography>
                    <Typography variant="body2" color="textSecondary">
                        How activities are grouped in the CMS and filtered on the website. The order here is the order guests see.
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12} md={5} lg={4}>
                <MainCard title={isEditing ? "Edit Category" : "Add Category"}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <LBVInput
                                label={"Category Name"}
                                placeHolder={"e.g. Culinary Experience"}
                                value={form.name}
                                onChange={(e) => { onChange({ name: e.currentTarget.value }) }}
                                enterAction={() => { if (form.name.trim()) { saveCategory() } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput
                                label={"Description"}
                                type={"textarea"}
                                rows={2}
                                placeHolder={"One line describing what belongs in here"}
                                value={form.description}
                                onChange={(e) => { onChange({ description: e.currentTarget.value }) }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput
                                label={"Url Slug"}
                                disabled={true}
                                value={previewSlug(form.name)}
                                showInfo={"Generated from the name - it is the public url for this category"}
                                showAlert={slugChanging
                                    ? `Renaming changes the url from /${form.slug}${editingUsage ? `, and moves ${editingUsage} activit${editingUsage === 1 ? 'y' : 'ies'}` : ''}`
                                    : null}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Switch
                                    checked={form.isActive}
                                    onChange={() => onChange({ isActive: !form.isActive })}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {form.isActive ? "Active - offered and filterable" : "Inactive - hidden from new activities"}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                            {
                                isEditing &&
                                <Grid item>
                                    <Button color="secondary" variant="outlined" onClick={() => { setForm(emptyForm()) }}>
                                        Cancel
                                    </Button>
                                </Grid>
                            }
                            <Grid item>
                                <Button variant="contained" disabled={saving || !form.name.trim()} onClick={saveCategory}>
                                    {isEditing ? "Update Category" : "Create Category"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </MainCard>
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
                <MainCard
                    title="All Categories"
                    content={false}
                    secondary={
                        <Typography variant="caption" color="textSecondary">
                            {`${rows.length} categor${rows.length === 1 ? 'y' : 'ies'}`}
                        </Typography>
                    }
                >
                    {/* The table keeps its own scroll so narrow screens never widen the page. */}
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: 72 }}>Order</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Activities</TableCell>
                                    <TableCell>Active</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    loading &&
                                    [0, 1, 2, 3].map(row => (
                                        <TableRow key={row}>
                                            <TableCell colSpan={6}><Skeleton height={34} /></TableCell>
                                        </TableRow>
                                    ))
                                }

                                {
                                    !loading && !rows.length &&
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 5 }}>
                                                No categories yet - add the first one on the left.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    !loading && rows.map((category, index) => (
                                        <TableRow key={category._id} hover selected={form._id === category._id}>
                                            <TableCell>
                                                <Stack direction="row" spacing={0}>
                                                    <Tooltip title="Move up">
                                                        <span>
                                                            <IconButton size="small" disabled={index === 0} onClick={() => { move(index, -1) }}>
                                                                <ArrowUpOutlined style={{ fontSize: '0.75rem' }} />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Move down">
                                                        <span>
                                                            <IconButton size="small" disabled={index === rows.length - 1} onClick={() => { move(index, 1) }}>
                                                                <ArrowDownOutlined style={{ fontSize: '0.75rem' }} />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 260, whiteSpace: 'normal' }}>
                                                <Typography variant="subtitle2">{category.name}</Typography>
                                                {category.description && (
                                                    <Typography variant="caption" color="textSecondary">{category.description}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace' }}>
                                                    {category.slug}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={category.activityCount || 0}
                                                    sx={{ bgcolor: 'secondary.lighter', color: 'text.primary', fontWeight: 500 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    size="small"
                                                    checked={category.isActive !== false}
                                                    onChange={() => { toggleActive(category) }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="Edit category">
                                                        <IconButton size="small" color="primary" onClick={() => {
                                                            setForm({
                                                                _id: category._id,
                                                                name: category.name,
                                                                slug: category.slug,
                                                                description: category.description || '',
                                                                isActive: category.isActive !== false
                                                            })
                                                        }}>
                                                            <EditOutlined />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={category.activityCount
                                                        ? "In use - switch it off instead"
                                                        : "Delete category"}>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                disabled={!!category.activityCount}
                                                                onClick={() => { setDeleteDialog({ open: true, category }) }}
                                                            >
                                                                <DeleteOutlined />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </Box>
                </MainCard>
            </Grid>

            <Dialog open={deleteDialog.open} onClose={() => { setDeleteDialog({ open: false, category: null }) }}>
                <Grid container p={2.5} spacing={2} sx={{ maxWidth: 420 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>Delete category?</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {`"${deleteDialog.category ? deleteDialog.category.name : ''}" will be removed from the CMS picker and the website filter. This cannot be undone.`}
                        </Typography>
                    </Grid>
                    <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                        <Grid item>
                            <Button color="secondary" variant="outlined" onClick={() => {
                                setDeleteDialog({ open: false, category: null })
                            }}>Cancel</Button>
                        </Grid>
                        <Grid item>
                            <Button color="error" variant="contained" onClick={removeCategory}>Delete</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default Categories
