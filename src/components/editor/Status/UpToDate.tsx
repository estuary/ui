import { CloudDone } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function UpToDate({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.upToDate" />
            </Typography>

            <CloudDone sx={{ fontSize: iconSize }} />
        </>
    );
}

export default UpToDate;
