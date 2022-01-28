import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { useIntl } from 'react-intl';
import logoDark from '../../images/dark/logo-estuary.png';
import logoLight from '../../images/light/logo-estuary.png';

type LogoProps = {
    width: number;
};

const Logo = (props: LogoProps) => {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <Box
            sx={{
                pr: 2,
                border: 0,
            }}
        >
            <img
                src={theme.palette.mode === 'dark' ? logoDark : logoLight}
                alt={intl.formatMessage({ id: 'company' })}
                width={props.width}
            />
        </Box>
    );
};

export default Logo;
