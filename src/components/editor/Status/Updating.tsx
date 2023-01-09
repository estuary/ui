import { CloudDownload } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Updating({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.updating" />
            </Typography>

            <CloudDownload sx={{ fontSize: iconSize }} />
        </>
    );
}

export default Updating;
