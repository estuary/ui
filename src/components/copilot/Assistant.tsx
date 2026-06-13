import { useEffect } from 'react';

import {
    Box,
    Drawer,
    Fab,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { CopilotKit, useCopilotChatHeadless_c } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import { Sparks, Xmark } from 'iconoir-react';

import { ASSISTANT_INSTRUCTIONS } from 'src/components/copilot/shared';
import useCopilotPageContext from 'src/hooks/copilot/useCopilotPageContext';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';
import { getCopilotSettings } from 'src/utils/env-utils';

import '@copilotkit/react-ui/styles.css';

const { runtimeUrl } = getCopilotSettings();

const DRAWER_WIDTH = 440;

// Sends a queued prompt (from an "Explain" affordance) into the chat. Mounted
// at provider level so it works even when the panel was closed when triggered.
function PromptBridge() {
    const pendingPrompt = useCopilotAssistantStore(
        (state) => state.pendingPrompt
    );
    const clearPendingPrompt = useCopilotAssistantStore(
        (state) => state.clearPendingPrompt
    );
    const { sendMessage } = useCopilotChatHeadless_c();

    useEffect(() => {
        if (!pendingPrompt) {
            return;
        }

        void sendMessage({
            id: crypto.randomUUID(),
            role: 'user',
            content: pendingPrompt,
        });
        clearPendingPrompt();
    }, [pendingPrompt, sendMessage, clearPendingPrompt]);

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
                            flex: 1,
                            minHeight: 0,
                            // Match the CopilotKit chat to the MUI theme.
                            '--copilot-kit-primary-color':
                                theme.palette.primary.main,
                            '--copilot-kit-contrast-color':
                                theme.palette.primary.contrastText,
                            '--copilot-kit-background-color':
                                theme.palette.background.paper,
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
                                initial: "Hi! I can explain log messages, Flow features, and how to set up this connector. What would you like to know?",
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
    return (
        <CopilotKit runtimeUrl={runtimeUrl}>
            <PageContext />
            <PromptBridge />
            <AssistantPanel />
        </CopilotKit>
    );
}
