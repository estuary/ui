import { useTheme } from '@mui/material';

import darkLogo from 'src/images/combination-marks/combination-mark__multi-blue.png';
import lightLogo from 'src/images/combination-marks/combination-mark__white.png';

function CompanyLogo() {
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'dark' ? lightLogo : darkLogo}
            height="25px"
            width="125px"
            alt="Estuary"
        />
    );
}

export default CompanyLogo;
