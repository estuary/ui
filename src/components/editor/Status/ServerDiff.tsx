import { Button, Typography, useTheme } from '@mui/material';

import { DatabaseXmark } from 'iconoir-react';

interface Props {
    iconSize: number;
    onMerge: Function;
}

function ServerDiff({ iconSize, onMerge }: Props) {
    const theme = useTheme();

    return (
        <>
            <Typography>
                Your version is out of sync with the server.
            </Typography>

            <DatabaseXmark
                style={{ fontSize: iconSize, color: theme.palette.error.main }}
            />

            <Button onClick={() => onMerge()} disabled>
                See changes
            </Button>
        </>
    );
}

export default ServerDiff;
