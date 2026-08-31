import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Grid, LinearProgress, IconButton, Stack, Tooltip } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMoveImmutable } from 'array-move';

import DropZoneComponent from "./DropzoneComponent";
import { LBVLabel, LBVTitleLabel } from "./LBVLabel";
import { LBVInput } from "./LBVInput";
import { uploadImage, runWithConcurrency, isImageFile, readableUploadError, UPLOAD_CONCURRENCY } from "helper/upload";

// Defined at module scope on purpose. The previous code built these inside the
// render function, so every keystroke produced brand new component types and
// React remounted the entire image grid.
//
// This used to be react-sortable-hoc. That library starts a drag from a native
// mousemove listener and guards itself with `this.state.sorting`; under React 18
// that setState is flushed on a later task, so a quick drag delivered mouseup
// while the flag still read false. Its own cleanup then nulled `manager.active`
// before `handleSortEnd` read `active.collection` off it - the null crash. The
// guard is internal, so the only fix is to stop using it. dnd-kit keeps drag
// state in refs and is React 18 safe.

// Each tile is both the thing you pick up and the slot you drop onto, so it
// registers as a draggable and a droppable under the same id (the image URL,
// which `addUnique` already keeps unique).
function ImageTile({ id, index, disabled, isActive, isOver, onRemove }) {
    const { setNodeRef: setDragRef, attributes, listeners } = useDraggable({ id, disabled });
    const { setNodeRef: setDropRef } = useDroppable({ id, disabled });

    const setNodeRef = useCallback((node) => {
        setDragRef(node);
        setDropRef(node);
    }, [setDragRef, setDropRef]);

    return (
        <Grid item xs={4} sm={3} p={0.5}>
            <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                style={{
                    position: 'relative',
                    background: '#eee',
                    height: 90,
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: disabled ? 'default' : 'grab',
                    // Long-press starts a drag on touch; without this the browser
                    // also pans the page and the gesture fights itself.
                    touchAction: 'manipulation',
                    opacity: isActive ? 0.35 : 1,
                    outline: isOver && !isActive ? '2px solid #1976d2' : 'none',
                    outlineOffset: -2,
                }}
            >
                <img
                    src={id}
                    alt=""
                    // Images are draggable by default and the browser's own HTML5
                    // drag eats the pointer events dnd-kit needs.
                    draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                />
                <IconButton
                    size="small"
                    onClick={() => onRemove(index)}
                    // Keep the remove button a button - never the start of a drag.
                    onPointerDown={(event) => event.stopPropagation()}
                    sx={{
                        position: 'absolute', top: 2, right: 2, padding: '2px',
                        background: 'rgba(0,0,0,0.55)', color: 'white',
                        '&:hover': { background: 'rgba(0,0,0,0.8)' }
                    }}
                >
                    <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
            </div>
        </Grid>
    );
}

let uploadKey = 0;
const nextUploadId = () => `upload-${Date.now()}-${uploadKey++}`;

// The grid keys on the URL, so a duplicate would collide. Server-side keys are
// unique per upload; this only guards against re-adding an existing URL.
const addUnique = (current, incoming) => (
    current.concat(incoming.filter((url) => current.indexOf(url) < 0))
);

/**
 * Uploads images the moment they are dropped and reports each file's progress.
 *
 * `value` is always a list of real, persisted S3 URLs - nothing half-finished
 * ever reaches it. In-flight files live in local `uploads` state instead, which
 * is what lets the parent block Save until the queue is empty.
 */
function ImageUploader({
    value = [],
    onChange,
    onPendingChange,
    dirName,
    uploadName,
    title,
    disabled = false,
}) {
    const [uploads, setUploads] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [overId, setOverId] = useState(null);
    const [urlDraft, setUrlDraft] = useState('');
    const [urlError, setUrlError] = useState(null);

    // A drag has to travel before it counts, otherwise clicking the remove button
    // or just tapping a tile would be read as a sort. Touch waits instead of
    // moving, so scrolling the grid still scrolls.
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    );

    // Uploads resolve out of order and long after their render, so the callbacks
    // read through refs rather than capturing a stale `value`.
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    useEffect(() => { valueRef.current = value; }, [value]);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    const pending = uploads.filter((item) => item.status === 'uploading').length;
    useEffect(() => {
        if (onPendingChange) { onPendingChange(pending); }
    }, [pending, onPendingChange]);

    // Release the object URLs this component created when it goes away. Read
    // through a ref - an unmount cleanup closes over the state as it was at mount,
    // which would be an empty list.
    const uploadsRef = useRef(uploads);
    useEffect(() => { uploadsRef.current = uploads; }, [uploads]);
    useEffect(() => () => {
        uploadsRef.current.forEach((item) => { if (item.previewUrl) { URL.revokeObjectURL(item.previewUrl); } });
    }, []);

    const patchUpload = useCallback((id, patch) => {
        setUploads((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }, []);

    const dropUpload = useCallback((id) => {
        setUploads((prev) => {
            const target = prev.find((item) => item.id === id);
            if (target && target.previewUrl) { URL.revokeObjectURL(target.previewUrl); }
            return prev.filter((item) => item.id !== id);
        });
    }, []);

    const startUpload = useCallback(async (entry) => {
        patchUpload(entry.id, { status: 'uploading', progress: 0, error: null });
        try {
            const url = await uploadImage(entry.file, {
                dirName,
                onProgress: (progress) => patchUpload(entry.id, { progress }),
            });
            // Append to whatever the list holds *now*, not at drop time - four of
            // these land concurrently and out of order.
            onChangeRef.current(addUnique(valueRef.current, [url]));
            dropUpload(entry.id);
        } catch (error) {
            patchUpload(entry.id, { status: 'error', error: readableUploadError(error) });
        }
    }, [dirName, patchUpload, dropUpload]);

    const handleDrop = useCallback(async (files) => {
        if (disabled || !files) { return; }
        const incoming = Array.from(files);

        // Re-dropping an already-uploaded URL should not go near S3 again.
        const existingUrls = incoming.filter((file) => typeof file === 'string' && file.indexOf('http') === 0);
        if (existingUrls.length > 0) {
            onChangeRef.current(addUnique(valueRef.current, existingUrls));
        }

        const newFiles = incoming.filter(isImageFile);
        const rejected = incoming.length - existingUrls.length - newFiles.length;

        const entries = newFiles.map((file) => ({
            id: nextUploadId(),
            file,
            name: file.name,
            previewUrl: URL.createObjectURL(file),
            progress: 0,
            status: 'uploading',
            error: null,
        }));

        if (rejected > 0) {
            entries.push({
                id: nextUploadId(),
                file: null,
                name: `${rejected} file${rejected > 1 ? 's' : ''} skipped`,
                previewUrl: null,
                progress: 0,
                status: 'error',
                error: 'Not a supported image type',
            });
        }

        if (entries.length === 0) { return; }
        setUploads((prev) => [...prev, ...entries]);

        await runWithConcurrency(
            entries.filter((entry) => entry.file),
            UPLOAD_CONCURRENCY,
            startUpload,
        );
    }, [disabled, startUpload]);

    const removeImage = useCallback((index) => {
        onChangeRef.current(valueRef.current.filter((_, i) => i !== index));
    }, []);

    const handleDragStart = useCallback(({ active }) => {
        setActiveId(active.id);
        setOverId(null);
    }, []);

    const handleDragOver = useCallback(({ over }) => {
        setOverId(over ? over.id : null);
    }, []);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
        setOverId(null);
    }, []);

    // Resolved by URL rather than by the index captured at drag start - an upload
    // can land mid-drag and shift everything underneath.
    const handleDragEnd = useCallback(({ active, over }) => {
        setActiveId(null);
        setOverId(null);
        if (!over || active.id === over.id) { return; }

        const list = valueRef.current;
        const oldIndex = list.indexOf(active.id);
        const newIndex = list.indexOf(over.id);
        if (oldIndex < 0 || newIndex < 0) { return; }

        onChangeRef.current(arrayMoveImmutable(list, oldIndex, newIndex));
    }, []);

    const addUrl = useCallback(() => {
        const url = urlDraft.trim();
        if (!url) { return; }
        if (!/^https:\/\/\S+$/i.test(url)) {
            setUrlError('Needs to be a full https:// URL.');
            return;
        }
        onChangeRef.current(addUnique(valueRef.current, [url]));
        setUrlDraft('');
        setUrlError(null);
    }, [urlDraft]);

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <DropZoneComponent
                    className="drop-zone"
                    uploadName={uploadName}
                    isMultiple={true}
                    onDrop={(files) => handleDrop(files)}
                >
                    <div className='dropzone mb-0' style={{ textAlign: 'center', minHeight: 110 }}>
                        <div style={{ padding: 10 }}>
                            <label>
                                <i className='fa fa-upload mr-1' />
                                Drop images to upload
                            </label>
                            <br />
                            <label htmlFor={uploadName} style={{ cursor: 'pointer' }} className='dropzone-child mb-0'>
                                or Click to Browse
                            </label>
                            <div style={{ marginTop: 6 }}>
                                <LBVLabel style={{ fontSize: 11, color: '#858585' }}>
                                    Images upload as soon as you drop them - you can keep editing while they finish.
                                </LBVLabel>
                            </div>
                        </div>
                    </div>
                </DropZoneComponent>
            </Grid>

            {/* Uploading needs S3 credentials on the API. Where those are not set —
                a fresh environment, or before the bucket is wired up — the editor
                would otherwise be unusable for anything with a picture. Pasting a URL
                that is already hosted keeps the screen working, and is also how you
                reuse an image that is already in the bucket. */}
            <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ mt: 0.5 }}>
                    <LBVInput
                        label="Or paste an image URL"
                        placeHolder="https://…"
                        value={urlDraft}
                        disabled={disabled}
                        styles={{ width: '100%' }}
                        onChange={(e) => { setUrlDraft(e.currentTarget.value); setUrlError(null) }}
                        enterAction={addUrl}
                    />
                    <Button variant="outlined" disabled={disabled} onClick={addUrl} sx={{ minWidth: 90 }}>
                        Add
                    </Button>
                </Stack>
                {urlError && (
                    <LBVLabel style={{ fontSize: 11, color: '#f44336' }}>{urlError}</LBVLabel>
                )}
            </Grid>

            {uploads.length > 0 && (
                <Grid item xs={12}>
                    {uploads.map((item) => (
                        <Grid container key={item.id} alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Grid item>
                                {item.previewUrl
                                    ? <img src={item.previewUrl} alt="" style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 2 }} />
                                    : <ErrorOutlineIcon sx={{ color: '#c62828', fontSize: 20 }} />}
                            </Grid>
                            <Grid item xs>
                                <LBVLabel style={{ fontSize: 11 }}>{item.name}</LBVLabel>
                                {item.status === 'uploading' && (
                                    <LinearProgress variant="determinate" value={item.progress} sx={{ height: 4, borderRadius: 2 }} />
                                )}
                                {item.status === 'error' && (
                                    <LBVLabel style={{ fontSize: 11, color: '#c62828' }}>{item.error}</LBVLabel>
                                )}
                            </Grid>
                            <Grid item>
                                {item.status === 'uploading' && (
                                    <LBVLabel style={{ fontSize: 11, color: '#858585' }}>{item.progress}%</LBVLabel>
                                )}
                                {item.status === 'error' && (
                                    <>
                                        {item.file && (
                                            <Tooltip title="Retry">
                                                <IconButton size="small" onClick={() => startUpload(item)}>
                                                    <ReplayIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Dismiss">
                                            <IconButton size="small" onClick={() => dropUpload(item.id)}>
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Grid item xs={12}>
                {title && (
                    <LBVTitleLabel>
                        {title}{value.length > 0 ? ` (${value.length})` : ''}
                    </LBVTitleLabel>
                )}
                {value.length === 0 && uploads.length === 0 && (
                    <LBVLabel style={{ fontSize: 12, color: '#858585' }}>No images yet.</LBVLabel>
                )}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        <Grid container>
                            {value.map((url, index) => (
                                <ImageTile
                                    key={url}
                                    id={url}
                                    index={index}
                                    disabled={disabled}
                                    isActive={activeId === url}
                                    isOver={overId === url}
                                    onRemove={removeImage}
                                />
                            ))}
                        </Grid>
                    </div>
                    <DragOverlay>
                        {activeId && (
                            <div style={{
                                height: 90, borderRadius: 4, overflow: 'hidden',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.35)', cursor: 'grabbing',
                            }}>
                                <img
                                    src={activeId}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </Grid>
        </Grid>
    );
}

export default ImageUploader;
