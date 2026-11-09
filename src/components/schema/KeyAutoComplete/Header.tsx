import { IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';

function SchemaKeyHeader() {
    return (
        <Stack
            direction="row"
            sx={{
                alignItems: 'center',
                alignContent: 'center',
            }}
        >
            <Typography variant="subtitle1" component="div">
                Key
            </Typography>
            <Tooltip
                leaveDelay={250}
                title={
                    <>
                        Ordered JSON Pointers that define how a composite key
                        may be extracted from a collection document.
                    </>
                }
                placement="right"
            >
                <IconButton>
                    <HelpCircle />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

export default SchemaKeyHeader;
