import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';
import { RequestForm } from "./RequestForm";
import { Grid } from "@material-ui/core";
import { Request } from "./Request";
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles( {
    root          : {
        width    : 700,
        textAlign: "center"
    },
    header        : {
        marginBottom: 20
    },
    actionBar     : {
        paddingTop: 10,
        textAlign : 'center'
    },
    previewWrapper: {
        position: 'relative'
    },
    previewImg    : {
        position: 'absolute',
        top     : 0,
        left    : 0
    },
    previewDrag   : {
        backgroundColor: 'white',
        width          : 40,
        height         : 40,
    },
    requestList   : {}
} );


export const App = () => {
    const classes = useStyles();

    const [ fileError, setFileError ]   = useState( null );
    const [ previewImg, setPreviewImg ] = useState( {} );
    const [ requests, setRequests ]     = useState( [] );

    const onSelectFile = ( event ) => {
        const file = event.target.files[ 0 ];
        setFileError( null );

        if ( file ) {
            if ( file.size < 4 * 1048576 ) {
                setPreviewImg( {
                    currentFile: event.target.files[ 0 ],
                    img        : URL.createObjectURL( event.target.files[ 0 ] )
                } );
            } else {
                setFileError( "File too large" );
            }
        }
    }

    const onUpload = async ( { qrText, qrPosition, imgSize, qrSize, qrBoarder } ) => {

        setRequests( [ ...requests, {
            id       : uuid(),
            imageData: previewImg,
            qrText,
            qrPosition,
            qrBoarder,
            imgSize,
            qrSize
        } ] );
        setFileError( null );
        setPreviewImg( {} );
    }

    return (
        <Container className={ classes.root }>
            <Box className={ classes.header }>
                <Typography variant="h4" component="h1" align={ 'center' }>
                    Image Tagger
                </Typography>
            </Box>


            {
                previewImg?.img &&
                <RequestForm
                    img={ previewImg.img }
                    onUpload={ onUpload }
                />
            }


            <div className={ classes.actionBar }>
                {
                    !previewImg?.img &&
                    <>
                        {
                            fileError &&
                            <>
                                <Alert severity="error">{ fileError }</Alert>
                                <hr/>
                            </>
                        }

                        <label htmlFor="btn-upload">
                            <input
                                id="btn-upload"
                                name="btn-upload"
                                style={ { display: 'none' } }
                                type="file"
                                accept="image/jpg, image/jpeg, image/png"
                                onChange={ onSelectFile }/>
                            <Button
                                className="btn-choose"
                                variant="outlined"
                                component="span">
                                Choose Image
                            </Button>
                        </label>


                    </>
                }


                {
                    previewImg?.img &&
                    <Button
                        className="start-over"
                        component="span"
                        onClick={ () => {
                            setFileError( null );
                            setPreviewImg( {} );
                        } }
                    >Start Over</Button>
                }

            </div>


            {
                requests.length > 0 &&
                <div className={ classes.requestList }>
                    <hr/>
                    <Grid containerequestListr spacing={ 3 }>
                        {
                            requests.map( request => (
                                <Grid item xs={ 12 } key={ request.id }>
                                    <Request request={ request }/>
                                </Grid>

                            ) )
                        }
                    </Grid>
                </div>

            }

        </Container>
    );
}
