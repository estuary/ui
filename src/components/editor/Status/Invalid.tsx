import { Typography } from '@mui/material';

import { TriangleAlert } from 'lucide-react';
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

            <TriangleAlert style={{ fontSize: iconSize }} />
        </>
    );
}

export default Invalid;
