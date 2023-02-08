import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    header: string;
    marginBottom?: number;
}

function Title({ header, marginBottom }: Props) {
    return (
        <Typography
            component="span"
            sx={{
                mb: marginBottom,
                alignItems: 'center',
                fontSize: 18,
                fontWeight: '400',
            }}
        >
            <FormattedMessage id={header} />
        </Typography>
    );
}

export default Title;
