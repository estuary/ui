import { CloudDownload } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Synchronizing({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.synchronizing" />
            </Typography>

            <CloudDownload sx={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronizing;
