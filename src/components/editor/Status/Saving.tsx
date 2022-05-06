import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Saving({ iconSize }: Props) {
    return (
        <>
            <FormattedMessage id="common.saving" />
            <CloudSyncIcon sx={{ fontSize: iconSize }} />
        </>
    );
}

export default Saving;
