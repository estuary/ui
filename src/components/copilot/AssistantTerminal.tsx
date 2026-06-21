import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, InputBase, Stack, useTheme } from '@mui/material';

import {
    useCopilotAdditionalInstructions,
    useCopilotChatHeadless_c,
} from '@copilotkit/react-core';

import { ASSISTANT_INSTRUCTIONS } from 'src/components/copilot/shared';
import SidePanelDocsOpenButton from 'src/components/sidePanelDocs/OpenButton';
import { UpdateAlert } from 'src/components/UpdateAlert';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';

// A fully custom, headless terminal console for the assistant (driven by
// useCopilotChatHeadless_c — unlocked by the free public license key). It sits
// at the top of the content column. Collapsed, it shows only its prompt line —
// the "bottom" of the terminal — in place of the old top bar; expanding reveals
// the transcript above and pushes the page content down (the side nav stays
// put). Uses the app's own dark background and no separating borders, so it
// reads as a seamless extension of the chrome.

const PANEL_HEIGHT = '21vh';
// Height of the always-visible prompt line when collapsed; sized to read like
// the top bar it replaces.
const COLLAPSED_HEIGHT = 48;
const TERMINAL_PROMPT = '#56d364';
const TERMINAL_FONT =
    "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

// Renders a single chat message terminal-style: user turns as a `❯` prompt line,
// assistant turns as plain output, plus any attached generative UI (tool calls /
// approval cards) below the text.
function MessageLine({ message }: { message: any }) {
    const theme = useTheme();
    const content = typeof message?.content === 'string' ? message.content : '';
    const generativeUI = message?.generativeUI?.();
    const isUser = message?.role === 'user';

    if (!content && !generativeUI) {
        return null;
    }

    if (isUser) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    py: 0.5,
                    color: theme.palette.text.primary,
                }}
            >
                <Box
                    component="span"
                    sx={{ color: TERMINAL_PROMPT, userSelect: 'none' }}
                >
                    ❯
                </Box>
                <Box
                    component="span"
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                    {content}
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 0.5, color: theme.palette.text.primary }}>
            {content ? (
                <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {content}
                </Box>
            ) : null}
            {generativeUI ? (
                <Box sx={{ mt: content ? 1 : 0 }}>{generativeUI}</Box>
            ) : null}
        </Box>
    );
}

export default function AssistantTerminal() {
    const theme = useTheme();
    const open = useCopilotAssistantStore((state) => state.open);
    const pendingPrompt = useCopilotAssistantStore(
        (state) => state.pendingPrompt
    );
    const clearPendingPrompt = useCopilotAssistantStore(
        (state) => state.clearPendingPrompt
    );

    useCopilotAdditionalInstructions({
        instructions: ASSISTANT_INSTRUCTIONS,
        available: 'enabled',
    });
    const { messages, sendMessage, isLoading } = useCopilotChatHeadless_c();

    const [draft, setDraft] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const node = scrollRef.current;
        if (node) {
            node.scrollTop = node.scrollHeight;
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (open) {
            const id = window.setTimeout(() => inputRef.current?.focus(), 240);
            return () => window.clearTimeout(id);
        }
        return undefined;
    }, [open]);

    // Cmd/Ctrl+K toggles the terminal from anywhere in the app.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                const store = useCopilotAssistantStore.getState();
                store.setOpen(!store.open);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Prompts queued via the store (e.g. the Explain-this-log button) arrive as
    // pendingPrompt. Send them through the same headless chat the panel renders
    // — the legacy appendMessage path does not feed useCopilotChatHeadless_c.
    useEffect(() => {
        if (!pendingPrompt) {
            return;
        }
        void sendMessage({
            id: crypto.randomUUID(),
            role: 'user',
            content: pendingPrompt,
        } as any);
        clearPendingPrompt();
    }, [pendingPrompt, sendMessage, clearPendingPrompt]);

    const submit = () => {
        const text = draft.trim();
        if (!text || isLoading) {
            return;
        }
        setDraft('');
        // Typing into the collapsed prompt line should expand the terminal so
        // the answer is visible.
        useCopilotAssistantStore.getState().setOpen(true);
        void sendMessage({
            id: crypto.randomUUID(),
            role: 'user',
            content: text,
        } as any);
    };

    const messageNodes = useMemo(
        () =>
            (messages ?? []).map((message: any) => (
                <MessageLine key={message.id} message={message} />
            )),
        [messages]
    );

    const dim = theme.palette.text.secondary;

    return (
        <Box
            sx={{
                overflow: 'hidden',
                height: open ? PANEL_HEIGHT : COLLAPSED_HEIGHT,
                transition: 'height 220ms ease',
                background: theme.palette.background.default,
            }}
        >
            <Stack sx={{ height: '100%', fontFamily: TERMINAL_FONT }}>
                <Box
                    ref={scrollRef}
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        display: open ? 'block' : 'none',
                        px: 2,
                        py: 1.5,
                        fontFamily: TERMINAL_FONT,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: theme.palette.text.primary,
                    }}
                >
                    {messageNodes}

                    {isLoading ? (
                        <Box
                            component="span"
                            sx={{
                                'color': TERMINAL_PROMPT,
                                'animation': 'cpkBlink 1s steps(2) infinite',
                                '@keyframes cpkBlink': {
                                    '50%': { opacity: 0 },
                                },
                            }}
                        >
                            ▌
                        </Box>
                    ) : null}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1.25,
                        flexShrink: 0,
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            color: TERMINAL_PROMPT,
                            fontFamily: TERMINAL_FONT,
                            fontSize: 13,
                            lineHeight: 1.6,
                            userSelect: 'none',
                            alignSelf: 'flex-start',
                            pt: '1px',
                        }}
                    >
                        ❯
                    </Box>
                    <InputBase
                        inputRef={inputRef}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                submit();
                            }
                        }}
                        placeholder="type a command…"
                        multiline
                        maxRows={6}
                        sx={{
                            'flex': 1,
                            'color': theme.palette.text.primary,
                            'fontFamily': TERMINAL_FONT,
                            'fontSize': 13,
                            'lineHeight': 1.6,
                            'p': 0,
                            '& textarea::placeholder': {
                                color: dim,
                                opacity: 1,
                            },
                        }}
                    />
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', flexShrink: 0 }}
                    >
                        <UpdateAlert />
                        <SidePanelDocsOpenButton />
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}
