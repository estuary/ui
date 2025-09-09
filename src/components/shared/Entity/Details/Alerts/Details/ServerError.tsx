import type { FooDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { useState } from 'react';

import { Button, Dialog, Paper } from '@mui/material';

function ServerError({ datum, details }: FooDetailsProps) {
    const [open, setOpen] = useState(false);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(false);
    };

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    p: 1,
                    minHeight: 100,
                    maxHeight: 100,
                    fontFamily: `'Monaco', monospace`,
                }}
            >
                {details[0].dataVal}
                <Button onClick={() => setOpen(true)}>open</Button>
            </Paper>
            <Dialog open={open} maxWidth="lg" onClose={closeDialog}>
                {details[0].dataVal} but big
            </Dialog>
        </>
    );
}

export default ServerError;
