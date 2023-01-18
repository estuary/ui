import { CloudDone } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Synchronized({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.synchronized" />
            </Typography>

            <CloudDone sx={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronized;
