import { DbCheck } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { Typography } from '@mui/material';

interface Props {
    iconSize: number;
}

function Synchronized({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.synchronized" />
            </Typography>

            <DbCheck style={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronized;
