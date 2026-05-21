import { Button, Typography, useTheme } from '@mui/material';

import { DatabaseZap } from 'lucide-react';
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

            <DatabaseZap
                style={{ fontSize: iconSize, color: theme.palette.error.main }}
            />

            <Button onClick={() => onMerge()} disabled>
                <FormattedMessage id="monacoEditor.serverDiffCTA" />
            </Button>
        </>
    );
}

export default ServerDiff;
