import React, { useState, useEffect } from 'react';
import { Typography, Tooltip } from '@mui/material';
import { FileDrop } from 'react-file-drop';

function DropZoneComponent({
    onFrameDragEnter = (event) => console.log(event),
    onFrameDragLeave = (event) => console.log(event),
    onFrameDrop = (event) => console.log(event),
    onDragOver = (event) => console.log(event),
    onDragLeave = (event) => console.log(event),
    onDrop = (event) => console.log(event),
    resetFile,
    style,
    center,
    children,
    tooltip = "",
    className,
    label,
    uploadName = "file",
    file,
    isMultiple = false,
}) {
    const [dragOver, setDragOver] = useState(null)
    let position = {}
    if (center) {
        position = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }
    }
    style = {
        ...style,
        ...position
    }

    const customClass = {
        group: 'mb-2',
        label: 'text-uppercase mb-0',
        input: '',
        error: 'text-danger',
        ...className,
    };

    const customStyle = {
        label: {
            fontSize: 10,
            color: '#858585',
        },
        ...style,
    };

    const getLabel = () => {
        if (label) {
            return (<Typography style={customStyle.label} className={`d-flex ${customClass.label}`}>{label}</Typography>);
        }
        if (label === undefined || label === '') {
            return (<Typography style={customStyle.label} className={`d-flex ${customClass.label}`}>&nbsp;</Typography>);
        }
        return;
    }

    return (
        <FileDrop
            onFrameDragEnter={(event) => onFrameDragEnter(event)}
            onFrameDragLeave={(event) => onFrameDragLeave(event)}
            onFrameDrop={(event) => onFrameDrop(event)}
            onDragOver={(event) => {
                setDragOver(true)
                onDragOver(event)
            }}
            onDragLeave={(event) => {
                setDragOver(null)
                onDragLeave(event)
            }}
            onDrop={(files, event) => {
                setDragOver(null)
                onDrop(files, event)
            }}
        >
            {
                children &&
                <Tooltip title={tooltip}>
                    {children && React.cloneElement(children)}
                </Tooltip>
            }
            {
                !children && getLabel()
            }
            {
                !children &&
                <div className='dropzone mb-0' style={{
                    ...style,
                    // cursor: 'pointer',
                    textAlign: 'center'
                }}>
                    <Tooltip title={tooltip}>
                        <div style={{ padding: 10, alignItems: 'center' }}>
                            <label>
                                <i className='fa fa-upload mr-1' />
                                Drop image to upload
                            </label>
                            <br />
                            <label
                                htmlFor={uploadName}
                                style={{ cursor: 'pointer' }}
                                className='dropzone-child mb-0'>
                                or Click to Browse
                            </label>
                            {
                                file &&
                                <>
                                    {
                                        isMultiple ? (
                                            <div>
                                                {/* fix filename display  */}
                                                {file.map((files, index) => {
                                                    return (
                                                        <div className='d-flex' style={{ textAlign: 'left' }}>
                                                            <label className='mt-1 mb-0'>
                                                                Uploaded file : {files.name}
                                                                {
                                                                    resetFile &&
                                                                    <i className="ml-2 fa fa-times-circle" style={{ color: 'gray', cursor: 'pointer' }} onClick={() => resetFile(index)} />
                                                                }
                                                            </label>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                        :
                                        <div className='d-flex' style={{ textAlign: 'left' }}>
                                            <label className='mt-1 mb-0'>
                                                Uploaded file : {file.name}
                                                {
                                                    resetFile &&
                                                    <i className="ml-2 fa fa-times-circle" style={{ color: 'gray', cursor: 'pointer' }} onClick={resetFile} />
                                                }
                                            </label>
                                        </div>
                                    }
                                </>
                            }
                        </div>
                    </Tooltip>
                </div>
            }
            {
                // Clearing the value afterwards lets the same file be picked twice
                // in a row - otherwise onChange never fires the second time.
                isMultiple ?
                    <input
                        className="d-none" type="file" name="file" id={uploadName}
                        multiple="multiple" accept="image/*"
                        onChange={(e) => { onDrop(e.target.files, e); e.target.value = ''; }} />
                    :
                    <input
                        className="d-none" type="file" name="file" id={uploadName}
                        accept="image/*"
                        onChange={(e) => { onDrop(e.target.files, e); e.target.value = ''; }} />
            }
        </FileDrop>
    )
}

export default DropZoneComponent;