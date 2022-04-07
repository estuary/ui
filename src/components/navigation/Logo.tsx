import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { useIntl } from 'react-intl';
import logoDark from '../../images/dark/logo-estuary.png';
import logoLight from '../../images/light/logo-estuary.png';

type Props = {
    width: number;
};

const Logo = ({ width }: Props) => {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <Box
            sx={{
                border: 0,
                pr: 2,
            }}
        >
            <img
                src={theme.palette.mode === 'dark' ? logoDark : logoLight}
                alt={intl.formatMessage({ id: 'company' })}
                width={width}
            />
        </Box>
    );
};

export default Logo;
