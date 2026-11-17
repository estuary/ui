import { useTheme } from '@mui/material';

import darkMark from 'src/images/pictorial-marks/pictorial-mark__multi-blue.png';
import lightMark from 'src/images/pictorial-marks/pictorial-mark__white.png';

function CompanyMark() {
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'dark' ? lightMark : darkMark}
            height="21px"
            style={{ marginTop: '4px' }}
            alt="Estuary"
        />
    );
}

export default CompanyMark;
