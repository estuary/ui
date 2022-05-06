import ErrorIcon from '@mui/icons-material/Error';
import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
    onMerge: Function;
}

function ServerDiff({ iconSize, onMerge }: Props) {
    return (
        <>
            <FormattedMessage id="monacoEditor.serverDiff" />
            <ErrorIcon sx={{ fontSize: iconSize }} color="error" />
            <Button onClick={() => onMerge()}>
                <FormattedMessage id="monacoEditor.serverDiffCTA" />
            </Button>
        </>
    );
}

export default ServerDiff;
