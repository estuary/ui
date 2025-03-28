import { Typography } from '@mui/material';

import { DatabaseWarning } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Invalid({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.invalid" />
            </Typography>

            <DatabaseWarning style={{ fontSize: iconSize }} />
        </>
    );
}

export default Invalid;
