import { DbWarning } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { Typography } from '@mui/material';

interface Props {
    iconSize: number;
}

function Invalid({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.invalid" />
            </Typography>

            <DbWarning style={{ fontSize: iconSize }} />
        </>
    );
}

export default Invalid;
