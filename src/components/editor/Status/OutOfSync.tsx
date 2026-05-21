import { Typography } from '@mui/material';

import { TriangleAlert } from 'lucide-react';
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

            <TriangleAlert style={{ fontSize: iconSize }} />
        </>
    );
}

export default OutOfSync;
