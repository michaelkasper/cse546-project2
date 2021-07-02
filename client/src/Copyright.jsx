import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import * as React from "react";


export const Copyright = () => {
    return (
        <Typography variant="body2" color="text.secondary" align="center">
            { 'Copyright © ' }
            <Link color="inherit" href="https://material-ui.com/">
                Your Website
            </Link>{ ' ' }
            { new Date().getFullYear() }
            { '.' }
        </Typography>
    );
}
