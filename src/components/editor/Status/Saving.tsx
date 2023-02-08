import { Typography } from '@mui/material';
import { DatabaseBackup } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Saving({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.saving" />
            </Typography>

            <DatabaseBackup style={{ fontSize: iconSize }} />
        </>
    );
}

export default Saving;
