import { Typography } from '@mui/material';

import { DatabaseZap } from 'lucide-react';
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

            <DatabaseZap style={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronized;
