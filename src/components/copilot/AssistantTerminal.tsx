import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, InputBase, useTheme } from '@mui/material';

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
// at the top of the content column as a single scrolling text area whose last
// line is the live prompt. Collapsed, the area is pinned to the bottom so only
// that prompt line shows in place of the old top bar; expanding (Enter or
// Cmd/Ctrl+K) grows it downward, revealing the transcript above and pushing the
// page content down (the side nav stays put). Uses the app's own dark
// background and no separating borders, so it reads as part of the chrome.

// Default expanded height, as a fraction of the viewport; the user can drag the
// bottom edge to resize, clamped to [MIN_EXPANDED_HEIGHT, MAX_EXPANDED_RATIO].
const DEFAULT_EXPANDED_RATIO = 0.21;
const MIN_EXPANDED_HEIGHT = 80;
const MAX_EXPANDED_RATIO = 0.85;
// Height of the prompt line when collapsed; sized to read like the top bar it
// replaces.
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
    const [expandedHeight, setExpandedHeight] = useState(() =>
        Math.round(window.innerHeight * DEFAULT_EXPANDED_RATIO)
    );
    const [dragging, setDragging] = useState(false);
    const outerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Drag the bottom edge to resize the expanded panel.
    const startDrag = (event: React.MouseEvent) => {
        event.preventDefault();
        const top = outerRef.current?.getBoundingClientRect().top ?? 0;
        const max = Math.round(window.innerHeight * MAX_EXPANDED_RATIO);
        setDragging(true);

        const onMove = (moveEvent: MouseEvent) => {
            const next = moveEvent.clientY - top;
            setExpandedHeight(
                Math.min(Math.max(next, MIN_EXPANDED_HEIGHT), max)
            );
        };
        const onUp = () => {
            setDragging(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // Keep the prompt line (the last line) in view as messages stream and when
    // the panel toggles — collapsed, this is what pins the area to the prompt.
    useEffect(() => {
        const node = scrollRef.current;
        if (node) {
            node.scrollTop = node.scrollHeight;
        }
    }, [messages, isLoading, open]);

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

    // Render only the conversation turns. Tool-result messages (role 'tool')
    // carry raw JSON tool output, which should not surface in the transcript.
    const messageNodes = useMemo(
        () =>
            (messages ?? [])
                .filter(
                    (message: any) =>
                        message?.role === 'user' ||
                        message?.role === 'assistant'
                )
                .map((message: any) => (
                    <MessageLine key={message.id} message={message} />
                )),
        [messages]
    );

    const dim = theme.palette.text.secondary;

    return (
        <Box
            ref={outerRef}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                height: open ? expandedHeight : COLLAPSED_HEIGHT,
                transition: dragging ? 'none' : 'height 220ms ease',
                background: theme.palette.background.default,
                borderLeft: `1px solid ${theme.palette.divider}`,
            }}
        >
            {/* App chrome that used to live in the top bar; kept out of the text
                flow as a corner overlay. Both are conditional, so usually hidden. */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    height: COLLAPSED_HEIGHT,
                    pr: 1,
                }}
            >
                <UpdateAlert />
                <SidePanelDocsOpenButton />
            </Box>

            <Box
                ref={scrollRef}
                onClick={() => inputRef.current?.focus()}
                sx={{
                    height: '100%',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    px: 2,
                    py: 1.25,
                    fontFamily: TERMINAL_FONT,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: theme.palette.text.primary,
                }}
            >
                {/* Anchor content to the bottom: the auto top margin fills the
                    space above when the transcript is short (so the prompt sits
                    at the bottom edge / top of the content area), and collapses
                    to 0 so the area scrolls normally once it overflows. */}
                <Box sx={{ mt: 'auto', flexShrink: 0 }}>
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

                    <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
                        <Box
                            component="span"
                            sx={{
                                color: TERMINAL_PROMPT,
                                userSelect: 'none',
                                alignSelf: 'flex-start',
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
                    </Box>
                </Box>
            </Box>

            {open ? (
                <Box
                    onMouseDown={startDrag}
                    sx={{
                        'position': 'absolute',
                        'left': 0,
                        'right': 0,
                        'bottom': 0,
                        'height': 6,
                        'cursor': 'ns-resize',
                        'zIndex': 2,
                        '&:hover': {
                            background: theme.palette.divider,
                        },
                    }}
                />
            ) : null}
        </Box>
    );
}
