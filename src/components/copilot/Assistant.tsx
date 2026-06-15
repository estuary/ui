import { useEffect, useRef } from 'react';

import {
    Box,
    Drawer,
    Fab,
    GlobalStyles,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { CopilotKit, useCopilotChat } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import { Role, TextMessage } from '@copilotkit/runtime-client-gql';
import { Sparks, Xmark } from 'iconoir-react';

import DataflowActions from 'src/components/copilot/DataflowActions';
import DocsActions from 'src/components/copilot/DocsActions';
import { ASSISTANT_INSTRUCTIONS } from 'src/components/copilot/shared';
import TaskHealthActions from 'src/components/copilot/TaskHealthActions';
import useCopilotPageContext from 'src/hooks/copilot/useCopilotPageContext';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';
import { getCopilotSettings } from 'src/utils/env-utils';

import '@copilotkit/react-ui/styles.css';

const { runtimeUrl } = getCopilotSettings();

const DRAWER_WIDTH = 440;

// Bridges queued messages from the store into the chat. Mounted at provider
// level so it works even when the panel was closed when triggered.
// - pendingPrompt: a visible USER message that runs the model ("Explain this…").
// - pendingOpener: an ASSISTANT message appended WITHOUT running the model, so a
//   flow like "New Dataflow" opens with the agent already asking its first
//   question and no synthetic user prompt is shown.
function PromptBridge() {
    const pendingPrompt = useCopilotAssistantStore(
        (state) => state.pendingPrompt
    );
    const clearPendingPrompt = useCopilotAssistantStore(
        (state) => state.clearPendingPrompt
    );
    const pendingOpener = useCopilotAssistantStore(
        (state) => state.pendingOpener
    );
    const clearPendingOpener = useCopilotAssistantStore(
        (state) => state.clearPendingOpener
    );
    const { appendMessage, isAvailable } = useCopilotChat();

    // Guards against StrictMode's double-effect appending the opener twice.
    // Resets naturally on remount, which is exactly when a new interview
    // starts (the provider is keyed on threadNonce).
    const openerAppended = useRef(false);

    useEffect(() => {
        if (!pendingPrompt) {
            return;
        }

        void appendMessage(
            new TextMessage({ content: pendingPrompt, role: Role.User })
        );
        clearPendingPrompt();
    }, [pendingPrompt, appendMessage, clearPendingPrompt]);

    useEffect(() => {
        if (!pendingOpener || openerAppended.current) {
            return;
        }

        // The provider remounts (keyed on threadNonce) for each new interview,
        // so the thread is already empty here. Wait for the chat to be available
        // before appending — on a fresh mount the runtime session isn't ready
        // yet, and an append fired before then is silently dropped. Once ready,
        // show the agent's opening question (followUp: false → no model call);
        // the interview proceeds when the user replies.
        if (!isAvailable) {
            return;
        }

        openerAppended.current = true;
        void appendMessage(
            new TextMessage({ content: pendingOpener, role: Role.Assistant }),
            { followUp: false }
        );
        clearPendingOpener();
    }, [pendingOpener, isAvailable, appendMessage, clearPendingOpener]);

    return null;
}

// Feeds current-page context (connector, entity, docs URL) to the assistant.
function PageContext() {
    useCopilotPageContext();
    return null;
}

function AssistantPanel() {
    const theme = useTheme();
    const open = useCopilotAssistantStore((state) => state.open);
    const setOpen = useCopilotAssistantStore((state) => state.setOpen);

    return (
        <>
            <Fab
                color="primary"
                aria-label="Open Flow assistant"
                onClick={() => setOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: theme.zIndex.speedDial,
                }}
            >
                <Sparks />
            </Fab>

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{
                    paper: { sx: { width: DRAWER_WIDTH, maxWidth: '100vw' } },
                }}
            >
                <Stack sx={{ height: '100%' }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ px: 2, py: 1.5 }}
                    >
                        <Typography variant="h6">Flow assistant</Typography>

                        <IconButton
                            aria-label="Close Flow assistant"
                            onClick={() => setOpen(false)}
                        >
                            <Xmark />
                        </IconButton>
                    </Stack>

                    <Box
                        sx={{
                            'flex': 1,
                            'minHeight': 0,
                            // Match the CopilotKit chat to the MUI theme.
                            '--copilot-kit-primary-color':
                                theme.palette.primary.main,
                            '--copilot-kit-contrast-color':
                                theme.palette.primary.contrastText,
                            '--copilot-kit-background-color':
                                theme.palette.background.paper,
                            // Input field bg — defaults to white, which leaves
                            // the light text unreadable in dark mode.
                            '--copilot-kit-input-background-color':
                                theme.palette.background.default,
                            '--copilot-kit-secondary-color':
                                theme.palette.background.default,
                            '--copilot-kit-secondary-contrast-color':
                                theme.palette.text.primary,
                            '--copilot-kit-separator-color':
                                theme.palette.divider,
                            '& .copilotKitChat': { height: '100%' },
                        }}
                    >
                        <CopilotChat
                            instructions={ASSISTANT_INSTRUCTIONS}
                            labels={{
                                title: 'Flow assistant',
                            }}
                        />
                    </Box>
                </Stack>
            </Drawer>
        </>
    );
}

// Top-level assistant: CopilotKit provider + readable page context + prompt
// bridge + the floating panel. Mounted inside the authenticated layout.
export default function CopilotAssistant() {
    // Bumped by openWithOpener (the "New Dataflow" button). Used as the provider
    // `key` so each new interview remounts CopilotKit with a fresh, empty
    // message thread — the version's reset()/setMessages don't reliably clear
    // the v2 store, so a remount is the dependable way to start clean.
    const threadNonce = useCopilotAssistantStore((state) => state.threadNonce);

    return (
        <>
            {/* showDevConsole={false} doesn't reliably suppress CopilotKit's v2
                web-inspector custom element (a version-bridge quirk), so hide it
                directly. */}
            <GlobalStyles
                styles={{ 'cpk-web-inspector': { display: 'none !important' } }}
            />
            <CopilotKit
                key={`thread-${threadNonce}`}
                runtimeUrl={runtimeUrl}
                showDevConsole={false}
            >
                <PageContext />
                <DocsActions />
                <TaskHealthActions />
                <DataflowActions />
                <PromptBridge />
                <AssistantPanel />
            </CopilotKit>
        </>
    );
}
