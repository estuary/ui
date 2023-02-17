import { Typography } from '@mui/material';
import { DbWarning } from 'iconoir-react';
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

            <DbWarning style={{ fontSize: iconSize }} />
        </>
    );
}

export default OutOfSync;
