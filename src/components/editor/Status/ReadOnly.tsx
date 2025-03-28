import { Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import EditOff from 'src/icons/EditOff';

interface Props {
    iconSize: number;
}

function ReadOnly({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.readOnly" />
            </Typography>

            <EditOff style={{ fontSize: iconSize }} />
        </>
    );
}

export default ReadOnly;
