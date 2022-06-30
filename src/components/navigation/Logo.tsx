import Box from '@mui/material/Box';
import { useIntl } from 'react-intl';
import darkLogo from 'images/pictorial-marks/pictorial-mark__slate.png';
import lightLogo from 'images/pictorial-marks/pictorial-mark__white.png';
import { useTheme } from '@mui/material';

type Props = {
    width: number;
};

const Logo = ({ width }: Props) => {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', px: '3px' }}>
            <img
                src={theme.palette.mode === 'dark' ? lightLogo : darkLogo}
                alt={intl.formatMessage({ id: 'company' })}
                width={width}
            />
        </Box>
    );
};

export default Logo;
