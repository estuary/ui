import { Typography } from '@mui/material';
import { DbCheck } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Saved({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.saved" />
            </Typography>

            <DbCheck style={{ fontSize: iconSize }} />
        </>
    );
}

export default Saved;
