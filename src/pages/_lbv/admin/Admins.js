import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import MainCard from "components/MainCard";
import { deleteAdmin, getAdminList } from "services/adminService";

// The original super admin account cannot be deleted - losing it would lock
// everyone out of the CMS.
const PROTECTED_ADMIN_ID = "66eee6b3d996a9edf2f856ae"

function Admins () {
    const navigate = useNavigate()

    const [ admins, setAdmins ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ deleteDialog, setDeleteDialog ] = useState({ open: false, admin: null })

    useEffect(() => {
        loadAdminList()
    }, [])

    const loadAdminList = async () => {
        setLoading(true)
        let { data, error } = await getAdminList()
        setLoading(false)
        if (error) { toast.error(error) }
        if (data) { setAdmins(data) }
    }

    const removeAdmin = async (adminId) => {
        setDeleteDialog({ open: false, admin: null })
        let { data, error } = await deleteAdmin({ adminId })
        if (error) { toast.error(error) }
        if (data) { toast.success("Admin removed"); setAdmins(data) }
    }

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="h4">Admins</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Who can sign in to this CMS, and how much of it they can see.
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<PlusOutlined />}
                        onClick={() => { navigate('/setting/admins/add-admin') }}
                    >
                        Add Admin
                    </Button>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <MainCard
                    title="All Admins"
                    content={false}
                    secondary={
                        <Typography variant="caption" color="textSecondary">
                            {`${admins.length} account${admins.length === 1 ? '' : 's'}`}
                        </Typography>
                    }
                >
                    {/* The table keeps its own scroll so narrow screens never widen the page. */}
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    loading &&
                                    [0, 1, 2].map(row => (
                                        <TableRow key={row}>
                                            <TableCell colSpan={4}><Skeleton height={34} /></TableCell>
                                        </TableRow>
                                    ))
                                }

                                {
                                    !loading && !admins.length &&
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 5 }}>
                                                No admin accounts found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    !loading && admins.map(admin => {
                                        const isProtected = String(admin._id) === PROTECTED_ADMIN_ID
                                        const isSuperAdmin = !admin.role || admin.role === 'superadmin'

                                        return (
                                            <TableRow key={admin._id} hover>
                                                <TableCell>
                                                    <Typography variant="subtitle2">{admin.name || '-'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="textSecondary">{admin.username}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={admin.role || 'superadmin'}
                                                        sx={{
                                                            textTransform: 'capitalize',
                                                            fontWeight: 500,
                                                            bgcolor: isSuperAdmin ? 'primary.lighter' : 'secondary.lighter',
                                                            color: isSuperAdmin ? 'primary.main' : 'text.secondary'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                        <Tooltip title="Edit admin">
                                                            <IconButton size="small" color="primary" onClick={() => {
                                                                // was /places/:id - the Edit button opened a property
                                                                navigate(`/setting/admins/${admin._id}`)
                                                            }}>
                                                                <EditOutlined />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={isProtected ? "The original super admin cannot be removed" : "Remove admin"}>
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    disabled={isProtected}
                                                                    onClick={() => { setDeleteDialog({ open: true, admin }) }}
                                                                >
                                                                    <DeleteOutlined />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </Box>
                </MainCard>
            </Grid>

            <Dialog open={deleteDialog.open} onClose={() => { setDeleteDialog({ open: false, admin: null }) }}>
                <Grid container p={2.5} spacing={2} sx={{ maxWidth: 420 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>Remove this admin?</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {`${deleteDialog.admin ? (deleteDialog.admin.name || deleteDialog.admin.username) : ''} will no longer be able to sign in to the CMS.`}
                        </Typography>
                    </Grid>
                    <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                        <Grid item>
                            <Button color="secondary" variant="outlined" onClick={() => {
                                setDeleteDialog({ open: false, admin: null })
                            }}>Cancel</Button>
                        </Grid>
                        <Grid item>
                            <Button color="error" variant="contained" onClick={() => {
                                if (deleteDialog.admin) { removeAdmin(deleteDialog.admin._id) }
                            }}>Remove</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Dialog>
        </Grid>
    )
}

export default Admins
