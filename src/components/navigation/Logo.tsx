import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import logoDark from '../../images/dark/logo-estuary.png';
import logoLight from '../../images/light/logo-estuary.png';

const LogoProps = {
    alt: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
};

const Logo = (props: PropTypes.InferProps<typeof LogoProps>) => {
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
                alt={props.alt}
                width={props.width}
            />
        </Box>
    );
};

export default Logo;
