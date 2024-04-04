import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { HelpCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

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
                <FormattedMessage id="schemaEditor.key.label" />
            </Typography>
            <Tooltip
                leaveDelay={250}
                title={<FormattedMessage id="schemaEditor.key.helper" />}
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
