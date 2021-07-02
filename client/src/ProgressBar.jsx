import { withStyles } from "@material-ui/styles";
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const BorderLinearProgress = withStyles( {
    root        : {
        height      : 25,
        borderRadius: 50,
    },
    colorPrimary: {
        backgroundColor: "#EEE",
    },
    bar         : {
        borderRadius   : 5,
        backgroundColor: '#1A90FF',
    },
} )( LinearProgress );


export const ProgressBar = ( { progress } ) => {

    return (
        <Box width="100%" display="flex" alignItems="center">
            <Box width="100%" mr={ 1 }>
                <BorderLinearProgress variant="determinate" value={ progress }/>
            </Box>
            <Box minWidth={ 35 }>
                <Typography variant="body2" color="textSecondary">{ `${ progress }%` }</Typography>
            </Box>
        </Box>
    )
}
