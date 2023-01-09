import { CloudOff } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function OutOfSync({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.outOfSync" />
            </Typography>

            <CloudOff sx={{ fontSize: iconSize }} />
        </>
    );
}

export default OutOfSync;
