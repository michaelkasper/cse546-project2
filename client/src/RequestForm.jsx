import Draggable from "react-draggable";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { TextField, Tooltip } from "@material-ui/core";
import classNames from "classnames";
import Button from "@material-ui/core/Button";
import validator from 'validator'

const qrSize    = 63;
const qrBoarder = 4;

const useStyles = makeStyles( {
    root          : {
        textAlign: "center"
    },
    actionBar     : {
        paddingTop: 10,
        textAlign : 'center'
    },
    input         : {
        paddingTop: 30,
    },
    submitBtn     : {
        paddingTop  : 30,
        marginBottom: 10
    },
    previewWrapper: {
        position   : 'relative',
        textAlign  : "center",
        marginLeft : "auto",
        marginRight: "auto",

    },
    previewImg    : {
        position: 'absolute',
        top     : 0,
        left    : 0
    },
    previewDrag   : {
        position     : 'absolute',
        top          : 0,
        left         : 0,
        cursor       : 'move',
        width        : qrSize + qrBoarder + qrBoarder,
        height       : qrSize + qrBoarder + qrBoarder,
        padding      : 5,
        '& img.pulse': {
            transform: 'scale(1)',
            animation: "pulse 1.5s infinite",
            boxShadow: '0 0 0 0 rgba(255, 255, 255, 1)',
        }
    },
    '@global'     : {
        "@keyframes pulse": {
            '0%'  : {
                transform: 'scale(0.95)',
                boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)',
            },
            '70%' : {
                transform: 'scale(1)',
                boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)',
            },
            '100%': {
                transform: 'scale(0.95)',
                boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)'
            }
        }
    }
} );

export const RequestForm = ( { img, onUpload: doUpload } ) => {
    const classes                         = useStyles();
    const [ imgSize, setImgSize ]         = useState( {
        height: 600,
        width : 600
    } );
    const [ qrPosition, setQrPosition ]   = useState( { x: 0, y: 0 } );
    const [ showTooltip, setShowTooltip ] = useState( true );
    const [ qrText, setQrText ]           = useState( '' );


    const setImageSize = ( { target: img } ) => {
        setImgSize( {
            height: img.offsetHeight,
            width : img.offsetWidth
        } )

        setQrPosition( {
            x: img.offsetWidth - 20 - ( qrSize + qrBoarder + qrBoarder ),
            y: img.offsetHeight - 20 - ( qrSize + qrBoarder + qrBoarder )
        } )
    }

    const onQrTextChange = ( e ) => {
        setQrText( e.target.value );
    }

    const onControlledDrag = ( e, position ) => {
        setQrPosition( position );
        setShowTooltip( false );
    };

    const onUpload = () => {
        doUpload( {
            qrText,
            qrPosition,
            imgSize,
            qrBoarder,
            qrSize: {
                width : ( qrSize + qrBoarder + qrBoarder ),
                height: ( qrSize + qrBoarder + qrBoarder )
            }
        } );
    }

    return (
        <div className={ classes.root } id={ 'request-form' }>
            <div id={ 'preview-wrapper' } className={ classes.previewWrapper }
                 style={ { height: imgSize.height, width: imgSize.width } }>
                <img
                    width={ '100%' }
                    className={ classes.previewImg }
                    src={ img }
                    onLoad={ setImageSize } alt=""
                    onDragStart={ ( e ) => {
                        e.preventDefault();
                    } }
                    id={ 'preview-image' }
                />
                <Draggable
                    bounds={ 'parent' }
                    position={ qrPosition } onDrag={ onControlledDrag }
                >
                    <div className={ classes.previewDrag }>
                        <Tooltip title="Drag Me" open={ showTooltip } placement={ 'right' } arrow={ true }>
                            <img className={ classNames( { 'pulse': showTooltip } ) } width={ '100%' }
                                 src={ '/preview-qr.svg' } onDragStart={ ( e ) => {
                                e.preventDefault();
                            } }/>
                        </Tooltip>
                    </div>
                </Draggable>
            </div>
            <div className={ classes.input }>
                <TextField
                    error={ qrText !== '' && !validator.isURL( qrText ) }
                    id={ 'qr-code-message' }
                    label="URL for QR-Code"
                    fullWidth={ true }
                    variant="outlined"
                    helperText="Enter a url that you would like to be converted to the QR Code"
                    onChange={ onQrTextChange }
                    InputLabelProps={ {
                        shrink: true,
                    } }
                />
            </div>

            <div className={ classes.submitBtn }>
                <Button id={ 'submit-request' } variant="contained" color="secondary" fullWidth={ true }
                        onClick={ onUpload } disabled={ !validator.isURL( qrText ) }>
                    Lets do this, Tag It!
                </Button>
            </div>
        </div>
    );
}
