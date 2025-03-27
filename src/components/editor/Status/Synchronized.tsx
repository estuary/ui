import { Typography } from '@mui/material';

import { DatabaseCheck } from 'iconoir-react';
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

            <DatabaseCheck style={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronized;
