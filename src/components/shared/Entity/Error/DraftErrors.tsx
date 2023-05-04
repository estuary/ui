import { Box, Typography } from '@mui/material';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import useDraftSpecErrors from 'hooks/useDraftSpecErrors';

export interface DraftErrorProps {
    draftId?: string | null;
    enablePolling?: boolean;
}

function DraftErrors({ draftId, enablePolling }: DraftErrorProps) {
    const { draftSpecErrors } = useDraftSpecErrors(draftId, enablePolling);

    if (draftSpecErrors.length > 0) {
        const errors: KeyValue[] = draftSpecErrors.map((draftError) => {
            const filteredScope = draftError.scope
                // Strip the canonical source file used by control-plane builds.
                // It's not user-defined and thus not useful to the user.
                .replace('file:///flow.json#', '')
                // Remove JSON pointer escapes. The result is not technically a JSON pointer,
                // but it's far more legible.
                .replaceAll('~1', '/')
                .replaceAll('~0', '~');

            // // Split by seperator so we can make a breadcrumb
            // const scopes = filteredScope
            //     .split('/')
            //     // Ensure the splits have values (mainly strips the first item)
            //     .filter((value) => hasLength(value));

            const detail = draftError.detail;

            return {
                val: (
                    <Box
                        sx={{
                            overflow: 'auto',
                            pl: 2,
                            whiteSpace: 'pre',
                        }}
                    >
                        {detail}
                    </Box>
                ),
                title: (
                    <Typography
                        variant="h6"
                        component="span"
                        sx={{
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderLeft: 0,
                            borderRight: 0,
                            borderTop: 0,
                            maxWidth: 'min-content',
                        }}
                    >
                        {filteredScope}
                    </Typography>
                ),
            };
        });
        return <KeyValueList data={errors} disableTypography />;
    } else {
        return null;
    }
}

export default DraftErrors;
