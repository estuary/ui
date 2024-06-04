import { Typography } from '@mui/material';
import { DatabaseWarning } from 'iconoir-react';
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

            <DatabaseWarning style={{ fontSize: iconSize }} />
        </>
    );
}

export default OutOfSync;
