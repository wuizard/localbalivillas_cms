import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { LBVLabel, LBVTitleLabel } from "../../../../components/_lbvcomponents/LBVLabel";
import AddRooms from "./AddRooms";
import LBVAccordion from "components/_lbvcomponents/LBVAccordion";
import {
    DragDropContext,
    Droppable,
    Draggable
} from "react-beautiful-dnd";

function Rooms ({
    rooms,
    saveRoomInfo,
    changeRoomIndex,
    deleteRoom,
    onRoomUploadingChange,
}) {

    const [localRows, setLocaRows] = useState(rooms);
    const [disableDrag, setDisableDrag] = useState([]);

    useEffect(() => {
        setLocaRows(rooms);
    }, [rooms]);

    useEffect(() => {
        console.log('here disableDrag', disableDrag)
    }, [disableDrag])

    const handleOnDragEnd = (result) => {
        try {
        // [source]: https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
        const { destination, source } = result;

        if (!destination) return;

        // check location change
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        // reoder 
        const newRows = Array.from(localRows);
        const [removed] = newRows.splice(source.index, 1);
        newRows.splice(destination.index, 0, removed);
        setLocaRows(newRows);
        changeRoomIndex(newRows);

        } catch (error) {
            console.error(error);
        }
    }
    
    return (
        <Grid container spacing={1}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId={'1'} style={{ width: '100%' }}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} style={{ width: '100%' }}>
                            {
                                rooms.map( (value, index) =>
                                    <Draggable key={value.clientId} draggableId={String(value.clientId)} index={index} isDragDisabled={disableDrag.length > 0}>
                                        {(providedDrag, snapshot) => (
                                            <div key={value.clientId}
                                                ref={providedDrag.innerRef}
                                                {...providedDrag.dragHandleProps}
                                                {...providedDrag.draggableProps}
                                                style={{ ...providedDrag.draggableProps.style, background: snapshot.isDragging ? "rgba(245,245,245, 0.75)" : "" }}>
                                                <Grid item xs={12} mt={2} p={0}>
                                                    <LBVAccordion outsideFunction={(e, expanded) => {
                                                        let isOpenedAccordion = disableDrag
                                                        if (!expanded) { 
                                                            isOpenedAccordion.splice(0, 1)
                                                            setDisableDrag([...isOpenedAccordion])
                                                        } else { 
                                                            isOpenedAccordion.push(e)
                                                            setDisableDrag([...isOpenedAccordion])
                                                        }
                                                    }} title={<LBVTitleLabel>{value.name || "New Room"}</LBVTitleLabel>}>
                                                        <AddRooms
                                                            deleteRoom={deleteRoom}
                                                            saveRoomInfo={saveRoomInfo}
                                                            index={index}
                                                            data={value}
                                                            onUploadingChange={onRoomUploadingChange}
                                                        />
                                                    </LBVAccordion>
                                                </Grid>
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            }
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </Grid>
    )
}

export default Rooms