import type { EntityErrorProps } from 'src/components/shared/Entity/Error/types';

import { useRef } from 'react';

import { Box, Divider, Stack } from '@mui/material';

import { useEffectOnce } from 'react-use';

import { useEditorStore_discoveredDraftId } from 'src/components/editor/Store/hooks';
import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import ErrorLogs from 'src/components/shared/Entity/Error/Logs';
import HeaderSummary from 'src/components/shared/Entity/HeaderSummary';
import Error from 'src/components/shared/Error';
import useScrollIntoView from 'src/hooks/useScrollIntoView';

function EntityError({ logToken, error, title, draftId }: EntityErrorProps) {
    const scrollToTarget = useRef<HTMLDivElement>(null);
    const scrollIntoView = useScrollIntoView(scrollToTarget);
    const discoveredDraftId = useEditorStore_discoveredDraftId();

    // When a user is discovering we need to make sure we show those errors
    //  but we would not want to show then at the same time we show test/pub
    //  draft errors.
    const idForDraftErrors = discoveredDraftId
        ? discoveredDraftId
        : draftId
          ? draftId
          : null;

    // The parent component hides this unless there is an error to show so we should be
    //  fine only calling this once.
    useEffectOnce(() => {
        scrollIntoView(scrollToTarget);
    });

    return (
        <>
            <Box ref={scrollToTarget} />
            <HeaderSummary severity="error" title={title}>
                <Stack direction="column" spacing={2}>
                    <Box>
                        <Error error={error} hideTitle={true} noAlertBox />

                        {idForDraftErrors ? (
                            <>
                                <Divider />
                                <DraftErrors draftId={idForDraftErrors} />
                            </>
                        ) : null}
                    </Box>

                    <ErrorLogs
                        logToken={logToken}
                        logProps={{
                            fetchAll: true,
                        }}
                    />
                </Stack>
            </HeaderSummary>
        </>
    );
}

export default EntityError;
