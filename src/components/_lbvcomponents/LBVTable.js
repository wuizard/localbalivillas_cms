import React from "react"

import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material"

import BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import { LBVLabel } from "./LBVLabel";

function LBVTable ({
    columns, // [{label: , customLabel: }]
    rows,
    valueCustomator,
    totalData,
    page = 0,
    pageChange,
    loading = false
}) {

    const onChangePage = (e) => {
        pageChange(e)
    }

    return (
        <Paper sx={{pb: 2}}>
            <BlockUi tag="div" blocking={loading}>          
                <TableContainer>
                    <Table sx={{
                        ".MuiTableCell-root": {
                            minWidth: "120px",
                        },
                    }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {
                                    columns.map(value => {
                                        return <TableCell><LBVLabel bold>{value.label}</LBVLabel></TableCell>
                                    })
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {
                            rows.map((row) => (
                                <TableRow
                                    key={row._id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    {
                                        Object.keys(valueCustomator(row)).map(value => {
                                            return <TableCell>{valueCustomator(row)[value]}</TableCell>
                                        })
                                    }
                                    {/* {
                                        row.valueCustomator
                                    } */}
                                </TableRow>
                            ))
                        }
                        </TableBody>
                    </Table>
                </TableContainer>  
            </BlockUi>
            <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={totalData ? totalData : rows.length}
                rowsPerPage={20}
                page={page}
                onPageChange={(event, page) => { onChangePage(page) }}
                onRowsPerPageChange={() => {}}
            />
        </Paper>
    )
}

export default LBVTable