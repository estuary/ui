import { Button, Typography, useTheme } from '@mui/material';
import { DatabaseXmark } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
    onMerge: Function;
}

function ServerDiff({ iconSize, onMerge }: Props) {
    const theme = useTheme();

    return (
        <>
            <Typography>
                <FormattedMessage id="monacoEditor.serverDiff" />
            </Typography>

            <DatabaseXmark
                style={{ fontSize: iconSize, color: theme.palette.error.main }}
            />

            <Button onClick={() => onMerge()} disabled>
                <FormattedMessage id="monacoEditor.serverDiffCTA" />
            </Button>
        </>
    );
}

export default ServerDiff;
