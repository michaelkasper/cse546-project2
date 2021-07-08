import React, { useEffect, useState } from "react";
import config from './services/config';
import { httpGateway } from "./services/httpGateway";
import { ProgressBar } from "./ProgressBar";
import { CircularProgress, Grid, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import fileDownload from "js-file-download";
import Button from "@material-ui/core/Button";
import classNames from "classnames";


const useStyles = makeStyles( {
    root     : {
        width: 648
    },
    '@global': {
        '.hide': {
            display: 'none !important'
        }
    }
} );


export const Request = ( { request } ) => {
    const classes                   = useStyles();
    const [ status, setStatus ]     = useState( 'pending' );
    const [ progress, setProgress ] = useState( null );
    const [ newImage, setNewImage ] = useState( null );


    const sendRequest = async () => {
        setStatus( 'processing' );

        let formData = new FormData();

        formData.append( 'qrText', request.qrText );
        formData.append( 'qrPositionX', request.qrPosition.x );
        formData.append( 'qrPositionY', request.qrPosition.y );
        formData.append( 'imgSizeW', request.imgSize.width );
        formData.append( 'imgSizeH', request.imgSize.height );
        formData.append( 'qrSizeW', request.qrSize.width );
        formData.append( 'qrSizeH', request.qrSize.height );
        formData.append( "image", request.imageData.currentFile );

        setProgress( 0 );

        try {
            const response = await httpGateway.post( config.API, formData, {
                responseType    : 'arraybuffer',
                headers         : {
                    "Content-Type": "multipart/form-data",
                    "Accept"      : "*/*",
                },
                onUploadProgress: ( event ) => {
                    setProgress( Math.round( ( 100 * event.loaded ) / event.total ) );
                }
            } );


            setNewImage( response.data );
            setStatus( 'complete' );
        } catch ( e ) {
            setStatus( 'error' );
        }
    }

    useEffect( () => {
        if ( status === 'pending' ) {
            sendRequest();
        }
    }, [] );


    const onDownload = ( e ) => {
        if ( !!newImage ) {
            const downloadName = ( e.target.dataset.downloadName || request.id + '.png' )
                .replace( /\.jpeg$/, ".png" )
                .replace( /\.jpg$/, ".png" );

            fileDownload( newImage, downloadName, "image/png" );
        }
    }

    return <div className={ classes.root }>
        <Grid container spacing={ 3 }
              alignItems="center"
              justify="center">
            <Grid item xs={ 2 }>
                <img width={ '80px' } src={ request.imageData.img }/>
            </Grid>
            <Grid item xs={ 1 }>
                <Tooltip title={ request.qrText } placement={ 'bottom' } arrow={ true }>
                    <img width={ '40px' } src={ '/preview-qr.svg' }/>
                </Tooltip>
            </Grid>
            <Grid item xs={ 6 }>
                {
                    progress != null &&
                    <ProgressBar progress={ progress }/>
                }
            </Grid>
            <Grid item xs={ 3 }>

                {
                    status !== 'error' &&
                    <Button
                        className={ classNames( 'download-btn', { 'hide': !newImage } ) }
                        variant="contained"
                        color="secondary"
                        fullWidth={ true }
                        onClick={ onDownload }
                        data-download-name={ request.imageData.currentFile.name }
                    >
                        Download
                    </Button>
                }

                {
                    !newImage && status !== 'error' &&
                    <CircularProgress color="secondary" classes={ 'waiting' }/>
                }


                {
                    status === 'error' &&
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth={ true }
                        onClick={ sendRequest }
                    >
                        Error, Try again
                    </Button>
                }

            </Grid>
        </Grid>
    </div>

}
