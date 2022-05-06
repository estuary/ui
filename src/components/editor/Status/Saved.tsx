import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Saved({ iconSize }: Props) {
    return (
        <>
            <FormattedMessage id="common.saved" />
            <CloudDoneIcon sx={{ fontSize: iconSize }} />
        </>
    );
}

export default Saved;
