import { createMuiTheme } from '@material-ui/core/styles';
import { red } from "@material-ui/core/colors";

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: 'rgb(220, 0, 78)',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
