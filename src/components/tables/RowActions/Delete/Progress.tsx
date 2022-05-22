import { Box, CircularProgress, ListItemText, Stack } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import Error from 'components/shared/Error';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    deleting: any;
    onFinish: (response: any) => void;
}

enum States {
    DELETING = 1,
    FAILED = 2,
    DELETED = 3,
}

function DeleteProgress({ deleting, onFinish }: Props) {
    const [state, setState] = useState<States>(States.DELETING);
    const [error, setError] = useState<any | null>(null);

    useEffect(() => {
        const failed = (response: any) => {
            console.log('response.error', response.error);

            setState(States.FAILED);
            setError(response.error);
            onFinish(response);
        };

        const succeeded = (response: any) => {
            setState(States.DELETED);
            onFinish(response);
        };

        const makeDeleteCall = async (spec: any) => {
            const entityResponse = await createEntityDraft(spec.catalog_name);
            if (entityResponse.error) {
                return failed(entityResponse);
            }

            const draftSpecResponse = await createDraftSpec(
                entityResponse.data[0].id,
                entityResponse.data[0].detail,
                null
            );
            if (draftSpecResponse.error) {
                return failed(draftSpecResponse);
            }

            const publishResponse = await createPublication(spec.id, true);
            if (publishResponse.error) {
                return failed(publishResponse);
            }

            return succeeded(publishResponse);
        };

        void makeDeleteCall(deleting);
    }, [deleting, onFinish]);

    return (
        <Box>
            <Stack direction="row" spacing={1}>
                {state === States.DELETING && <CircularProgress size={18} />}
                <ListItemText
                    primary={deleting.catalog_name}
                    secondary={
                        <FormattedMessage
                            id={
                                state === States.DELETED
                                    ? 'common.deleted'
                                    : state === States.FAILED
                                    ? 'common.fail'
                                    : 'common.deleting'
                            }
                        />
                    }
                />
            </Stack>
            {state === States.FAILED && error !== null ? (
                <Error error={error} hideTitle={true} />
            ) : null}
        </Box>
    );
}

export default DeleteProgress;
