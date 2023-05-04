import { Paper } from '@mui/material';
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
                    <Paper variant="outlined" sx={{ overflow: 'auto', p: 1 }}>
                        {detail}
                    </Paper>
                ),
                title: filteredScope,
            };
        });
        return <KeyValueList data={errors} disableTypography />;
    } else {
        return null;
    }
}

export default DraftErrors;
