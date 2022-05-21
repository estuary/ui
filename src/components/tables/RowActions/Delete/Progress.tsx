import { Box, CircularProgress, Stack } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import { useEffect } from 'react';

interface Props {
    deleting: any;
    onFinish: Function;
}

function DeleteProgress({ deleting, onFinish }: Props) {
    useEffect(() => {
        const makeDeleteCall = async (spec: any) => {
            const entityResponse = await createEntityDraft(spec.catalog_name);
            if (entityResponse.error) {
                return onFinish(entityResponse);
            }

            const draftSpecResponse = await createDraftSpec(
                entityResponse.data[0].id,
                entityResponse.data[0].detail,
                null,
                'capture'
            );
            if (draftSpecResponse.error) {
                return onFinish(draftSpecResponse);
            }

            const publishResponse = await createPublication(spec.id, true);
            return onFinish(publishResponse);
        };

        void makeDeleteCall(deleting);
    }, [deleting, onFinish]);

    return (
        <Stack direction="row" spacing={1}>
            <CircularProgress size={18} />
            <Box>{deleting.catalog_name}</Box>
        </Stack>
    );
}

export default DeleteProgress;
