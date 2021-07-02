import React, { useEffect, useState } from "react";
// import { httpGateway } from "./services/httpGateway";
import { ProgressBar } from "./ProgressBar";
import { Grid, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";


const useStyles = makeStyles( {
    root: {
        width: 648
    }
} );


export const Request = ( { request } ) => {
    const classes                   = useStyles();
    const [ progress, setProgress ] = useState( null );


    useEffect( () => {
        ( async () => {
            let formData = new FormData();

            formData.append( "file", request.imageData.currentFile );

            setProgress( 0 );

            // await httpGateway.post( "/upload", formData, {
            //     headers         : {
            //         "Content-Type": "multipart/form-data",
            //     },
            //     onUploadProgress: ( event ) => {
            //         setProgress( Math.round( ( 100 * event.loaded ) / event.total ) );
            //     }
            // } );
            //
            // setProgress( null );
        } )();

    }, [] );

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
            <Grid item xs={ 9 }>
                {
                    progress != null &&
                    <ProgressBar progress={ progress }/>
                }
            </Grid>
        </Grid>
    </div>

}
