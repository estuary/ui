import CloudOffIcon from '@mui/icons-material/CloudOff';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Invalid({ iconSize }: Props) {
    return (
        <>
            <FormattedMessage id="common.invalid" />
            <CloudOffIcon sx={{ fontSize: iconSize }} />
        </>
    );
}

export default Invalid;
