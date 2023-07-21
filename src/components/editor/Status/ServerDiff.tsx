import { DbError } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { Button, Typography, useTheme } from '@mui/material';

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

            <DbError
                style={{ fontSize: iconSize, color: theme.palette.error.main }}
            />

            <Button onClick={() => onMerge()} disabled>
                <FormattedMessage id="monacoEditor.serverDiffCTA" />
            </Button>
        </>
    );
}

export default ServerDiff;
