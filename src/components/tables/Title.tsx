import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    header: string;
}

function Title({ header }: Props) {
    return (
        <Typography
            component="span"
            variant="h6"
            sx={{
                alignItems: 'center',
            }}
        >
            <FormattedMessage id={header} />
        </Typography>
    );
}

export default Title;
