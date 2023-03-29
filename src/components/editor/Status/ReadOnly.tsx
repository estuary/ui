import { Typography } from '@mui/material';
import EditOff from 'icons/EditOff';
import { FormattedMessage } from 'react-intl';

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
