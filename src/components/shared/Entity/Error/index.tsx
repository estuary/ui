import type { EntityErrorProps } from 'src/components/shared/Entity/Error/types';

import { useRef } from 'react';

import { Box, Button, Divider, Stack } from '@mui/material';

import { Sparks } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useEffectOnce } from 'react-use';

import { buildEntityErrorHelpPrompt } from 'src/components/copilot/shared';
import { useEditorStore_discoveredDraftId } from 'src/components/editor/Store/hooks';
import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import ErrorLogs from 'src/components/shared/Entity/Error/Logs';
import HeaderSummary from 'src/components/shared/Entity/HeaderSummary';
import Error from 'src/components/shared/Error';
import useDraftSpecErrors from 'src/hooks/useDraftSpecErrors';
import useScrollIntoView from 'src/hooks/useScrollIntoView';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';

function EntityError({ logToken, error, title, draftId }: EntityErrorProps) {
    const intl = useIntl();
    const scrollToTarget = useRef<HTMLDivElement>(null);
    const scrollIntoView = useScrollIntoView(scrollToTarget);
    const discoveredDraftId = useEditorStore_discoveredDraftId();

    const openWithPromptInNewThread = useCopilotAssistantStore(
        (state) => state.openWithPromptInNewThread
    );

    // When a user is discovering we need to make sure we show those errors
    //  but we would not want to show then at the same time we show test/pub
    //  draft errors.
    const idForDraftErrors = discoveredDraftId
        ? discoveredDraftId
        : draftId
          ? draftId
          : null;

    // Same draft-error rows rendered below; handed to the assistant so a "Get
    // help" request carries the specific failure, not just the error title.
    const { draftSpecErrors } = useDraftSpecErrors(idForDraftErrors);

    // The parent component hides this unless there is an error to show so we should be
    //  fine only calling this once.
    useEffectOnce(() => {
        scrollIntoView(scrollToTarget);
    });

    const openAssistantForError = () => {
        // `title` is an i18n key (HeaderSummary localizes it for display); format
        // it the same way so the assistant gets readable text, not the raw key.
        // Open in a fresh thread so each help request is a clean conversation.
        openWithPromptInNewThread(
            buildEntityErrorHelpPrompt(
                intl.formatMessage({ id: title }),
                error?.message,
                draftSpecErrors
            )
        );
    };

    return (
        <>
            <Box ref={scrollToTarget} />
            <HeaderSummary severity="error" title={title}>
                <Stack direction="column" spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Sparks />}
                            onClick={openAssistantForError}
                        >
                            Get help
                        </Button>
                    </Box>

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
