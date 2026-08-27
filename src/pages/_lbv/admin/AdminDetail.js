import { Button, Grid, Stack, Switch, Typography } from "@mui/material";
import { LBVInput, LBVSelect } from "components/_lbvcomponents/LBVInput";
import MainCard from "components/MainCard";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { createAdmin, getAdminList, updateAdmin } from "services/adminService";

const adminRoleOptions = [
    { value: "superadmin", label: "superadmin"},
    { value: "finance", label: "finance"},
    { value: "admin", label: "admin"},
]

function AdminDetail () {

    const { id } = useParams()
    const navigate = useNavigate()

    const [ form, setForm ] = useState({
        name: "",
        username: "",
        role: { value: "superadmin", label: "superadmin"},
        password: "",
        isActive: true,
    })
    const [ loading, setLoading ] = useState(!!id)
    const [ saving, setSaving ] = useState(false)

    useEffect(() => {
        if (id) { loadAdmin() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // There is no get-one endpoint for admins, so the account is picked out of
    // the list - it is short enough for that to be cheap.
    const loadAdmin = async () => {
        setLoading(true)
        let { data, error } = await getAdminList()
        setLoading(false)
        if (error) { toast.error(error); return }
        let admin = (data || []).find(item => String(item._id) === String(id))
        if (!admin) { toast.error("Admin not found"); navigate('/setting/admins'); return }
        setForm({
            _id: admin._id,
            name: admin.name || "",
            username: admin.username || "",
            role: adminRoleOptions.find(option => option.value === admin.role) || adminRoleOptions[0],
            password: "",
            isActive: admin.isActive !== false
        })
    }

    const onChange = (e) => {
        setForm((prev) => ({
            ...prev,
            ...e
        }))
    }

    const submitForm = async () => {
        setSaving(true)
        let payload = {
            ...form,
            role: form.role ? form.role.value : null,
            // The update endpoint writes whatever it is given, so an empty field
            // would wipe the password rather than leave it alone.
            password: form.password ? form.password : undefined
        }
        let { data, error } = id ? await updateAdmin(payload) : await createAdmin(payload)
        setSaving(false)
        if (error) { toast.error(error) }
        if (data) {
            toast.success(id ? "Admin updated" : "Admin created")
            navigate('/setting/admins')
        }
    }

    const canSave = !!form.username.trim() && (!!id || !!form.password) && !saving && !loading

    return (
        <Grid container spacing={2.75}>
            <Grid item xs={12}>
                <Stack spacing={0.5}>
                    <Typography variant="h4">{id ? "Edit Admin" : "Add Admin"}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {id ? "Update this account's details or role." : "Create a new account that can sign in to this CMS."}
                    </Typography>
                </Stack>
            </Grid>

            <Grid item xs={12} md={6} lg={5}>
                <MainCard title="Account">
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <LBVInput label={"Name"} onChange={(e) => {
                                onChange({name: e.currentTarget.value})
                            }} value={form.name}/>
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput label={"Username"} onChange={(e) => {
                                onChange({username: e.currentTarget.value})
                            }}  value={form.username}/>
                        </Grid>
                        <Grid item xs={12}>
                            <LBVSelect label={"Role"} options={adminRoleOptions} onChange={(e) => {
                                onChange({role: e})
                            }}  value={form.role}/>
                        </Grid>
                        <Grid item xs={12}>
                            <LBVInput
                                label={"Password"}
                                type={"password"}
                                value={form.password}
                                showInfo={id ? "Leave blank to keep the current password" : null}
                                onChange={(e) => {
                                    onChange({password: e.currentTarget.value})
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Switch
                                    checked={form.isActive}
                                    onChange={() => onChange({isActive: !form.isActive})}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {form.isActive ? "Active - can sign in" : "Inactive - cannot sign in"}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item container xs={12} justifyContent={"flex-end"} spacing={1}>
                            <Grid item>
                                <Button color="secondary" variant="outlined" onClick={() => {
                                    navigate('/setting/admins')
                                }}>Cancel</Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" disabled={!canSave} onClick={submitForm}>
                                    {id ? "Update Admin" : "Create Admin"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </MainCard>
            </Grid>
        </Grid>
    )
}

export default AdminDetail
