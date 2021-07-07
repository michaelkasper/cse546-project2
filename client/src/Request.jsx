import React, { useEffect, useState } from "react";
import config from './services/config';
import { httpGateway } from "./services/httpGateway";
import { ProgressBar } from "./ProgressBar";
import { CircularProgress, Grid, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import fileDownload from "js-file-download";
import Button from "@material-ui/core/Button";


const useStyles = makeStyles( {
    root: {
        width: 648
    }
} );


export const Request = ( { request } ) => {
    const classes                   = useStyles();
    const [ status, setStatus ]     = useState( 'pending' );
    const [ progress, setProgress ] = useState( null );
    const [ newImage, setNewImage ] = useState( null );


    useEffect( () => {
        if ( status === 'pending' ) {
            setStatus( 'processing' );
            ( async () => {
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
            } )();
        }
    }, [] );


    const onDownload = () => {
        fileDownload( newImage, 'filename.png', "image/png" );
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
                    !!newImage &&
                    <Button variant="contained" color="secondary" fullWidth={ true } onClick={ onDownload }>
                        Download
                    </Button>
                }


                {
                    !newImage &&
                    progress === 100 &&
                    <CircularProgress color="secondary"/>
                }

            </Grid>
        </Grid>
    </div>

}
