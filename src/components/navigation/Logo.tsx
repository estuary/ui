import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';

import darkLogo from 'src/images/pictorial-marks/pictorial-mark__multi-blue.png';
import lightLogo from 'src/images/pictorial-marks/pictorial-mark__white.png';

type Props = {
    width: number;
};

const Logo = ({ width }: Props) => {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', px: '3px' }}>
            <img
                src={theme.palette.mode === 'dark' ? lightLogo : darkLogo}
                alt="Estuary"
                width={width}
            />
        </Box>
    );
};

export default Logo;
