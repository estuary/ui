import Box from '@mui/material/Box';
import { useIntl } from 'react-intl';
import logo from 'images/dark/pictorial-mark.png';

type Props = {
    width: number;
};

const Logo = ({ width }: Props) => {
    const intl = useIntl();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', px: '3px' }}>
            <img
                src={logo}
                alt={intl.formatMessage({ id: 'company' })}
                width={width}
            />
        </Box>
    );
};

export default Logo;
