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
            variant="h6"
            sx={{
                mb: marginBottom,
                alignItems: 'center',
            }}
        >
            <FormattedMessage id={header} />
        </Typography>
    );
}

export default Title;
