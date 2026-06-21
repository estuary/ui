import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, InputBase, useMediaQuery, useTheme } from '@mui/material';

import {
    useCopilotAdditionalInstructions,
    useCopilotChatHeadless_c,
} from '@copilotkit/react-core';

import { EntityHealthStrip } from 'src/components/copilot/EntityHealthStrip';
import {
    ASSISTANT_INSTRUCTIONS,
    TERMINAL_FONT,
} from 'src/components/copilot/shared';
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
// Width reserved at the top-right for the entity health strip plus the chrome
// buttons; the terminal text is padded to clear it so the two never overlap.
const STATUS_AREA_WIDTH = 460;
// Collapsed height once focused with a summary present: the bar grows to two
// lines — the agent activity summary above, the prompt below — so the user can
// type without expanding the whole transcript.
const COLLAPSED_HEIGHT_TWO_LINE = 78;
const TERMINAL_PROMPT = '#56d364';

// Tool calls that need explicit human approval keep their interactive card.
// Every other (read-only) tool call renders as a plain inline text line rather
// than a status card, so the transcript reads like terminal output.
const HITL_ACTIONS = new Set([
    'runGraphQLMutation',
    'runSetupSql',
    'collectConnectorConfig',
]);

const toolCallName = (call: any): string =>
    call?.function?.name ?? call?.name ?? 'tool call';

// Renders a single chat message terminal-style: user turns as a `❯` prompt line,
// assistant turns as plain output. Tool calls show as dim inline lines; only
// approval-required tool calls also render their interactive card.
function MessageLine({
    message,
    completedToolCallIds,
}: {
    message: any;
    completedToolCallIds: Set<string>;
}) {
    const theme = useTheme();
    const content = typeof message?.content === 'string' ? message.content : '';
    const isUser = message?.role === 'user';
    const toolCalls: any[] = Array.isArray(message?.toolCalls)
        ? message.toolCalls
        : [];
    const needsApproval = toolCalls.some((call) =>
        HITL_ACTIONS.has(toolCallName(call))
    );
    const generativeUI = needsApproval ? message?.generativeUI?.() : null;
    // Show only tool calls that are still running; once a tool result arrives
    // the call is complete and its line drops out of the transcript.
    const activeToolCalls = toolCalls.filter(
        (call) => !completedToolCallIds.has(call?.id)
    );

    if (!content && activeToolCalls.length === 0 && !generativeUI) {
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
            {activeToolCalls.map((call, index) => (
                <Box
                    key={call?.id ?? index}
                    sx={{
                        display: 'flex',
                        gap: 1,
                        py: 0.25,
                        color: theme.palette.text.secondary,
                    }}
                >
                    <Box component="span" sx={{ userSelect: 'none' }}>
                        ⏺
                    </Box>
                    <Box component="span" sx={{ wordBreak: 'break-word' }}>
                        {toolCallName(call)}
                    </Box>
                </Box>
            ))}
            {generativeUI ? (
                <Box sx={{ mt: content || activeToolCalls.length ? 1 : 0 }}>
                    {generativeUI}
                </Box>
            ) : null}
        </Box>
    );
}

export default function AssistantTerminal() {
    const theme = useTheme();
    // The health strip needs real horizontal room; hide it (and drop the
    // reserved padding) on narrow viewports.
    const showStatus = useMediaQuery(theme.breakpoints.up('lg'));
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
    const { messages, sendMessage, isLoading, stopGeneration } =
        useCopilotChatHeadless_c();

    const [draft, setDraft] = useState('');
    const [expandedHeight, setExpandedHeight] = useState(() =>
        Math.round(window.innerHeight * DEFAULT_EXPANDED_RATIO)
    );
    const [dragging, setDragging] = useState(false);
    // Collapsed, the bar shows just the agent activity summary until the user
    // focuses it; focusing reveals the prompt line beneath the summary.
    const [focused, setFocused] = useState(false);
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

    // The height transition resizes the viewport after the render above, so
    // re-pin to the bottom once it settles — collapsing should return to the
    // prompt line, not leave the view scrolled mid-transcript.
    useEffect(() => {
        const id = window.setTimeout(() => {
            const node = scrollRef.current;
            if (node) {
                node.scrollTop = node.scrollHeight;
            }
        }, 240);
        return () => window.clearTimeout(id);
    }, [open]);

    useEffect(() => {
        if (open && !isLoading) {
            const id = window.setTimeout(() => inputRef.current?.focus(), 240);
            return () => window.clearTimeout(id);
        }
        return undefined;
    }, [open, isLoading]);

    // Toggling the panel resets the collapsed focus state, so collapsing always
    // returns to the summary line and expanding hands off to the effect above.
    useEffect(() => {
        setFocused(false);
    }, [open]);

    // When the user focuses the collapsed bar, the prompt line mounts on the
    // next render; move the caret into it once it's there.
    useEffect(() => {
        if (focused && !open) {
            const id = window.setTimeout(() => inputRef.current?.focus(), 0);
            return () => window.clearTimeout(id);
        }
        return undefined;
    }, [focused, open]);

    // While a response is streaming, Esc interrupts it (mirrors the
    // "esc to interrupt" hint shown in place of the prompt).
    useEffect(() => {
        if (!isLoading) {
            return undefined;
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                stopGeneration();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isLoading, stopGeneration]);

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
        // Submitting keeps the panel at its current size and drops focus, so
        // the collapsed bar falls back to the one-line activity summary while
        // the agent works rather than expanding the transcript.
        setFocused(false);
        void sendMessage({
            id: crypto.randomUUID(),
            role: 'user',
            content: text,
        } as any);
    };

    // A tool call is complete once a matching tool-result message exists. Those
    // result messages (role 'tool') carry raw JSON we never render, but we use
    // their ids to drop completed tool calls from the transcript.
    const completedToolCallIds = useMemo(() => {
        const ids = new Set<string>();
        (messages ?? []).forEach((message: any) => {
            if (message?.role === 'tool' && message?.toolCallId) {
                ids.add(message.toolCallId);
            }
        });
        return ids;
    }, [messages]);

    // An approval card is open while one of its tool calls is still awaiting a
    // result. The input is blocked during this window — sending a new prompt
    // would strand the unanswered tool call and error the run.
    const awaitingApproval = useMemo(
        () =>
            (messages ?? []).some(
                (message: any) =>
                    Array.isArray(message?.toolCalls) &&
                    message.toolCalls.some(
                        (call: any) =>
                            HITL_ACTIONS.has(toolCallName(call)) &&
                            !completedToolCallIds.has(call?.id)
                    )
            ),
        [messages, completedToolCallIds]
    );

    // A one-line summary of what the agent is currently doing, shown on the
    // collapsed prompt line in place of the input while a response streams: the
    // name of an in-flight tool call, or the tail of the latest assistant text.
    const activitySummary = useMemo(() => {
        const list = messages ?? [];
        for (let i = list.length - 1; i >= 0; i -= 1) {
            const message: any = list[i];
            if (message?.role !== 'assistant') {
                continue;
            }
            const calls: any[] = Array.isArray(message.toolCalls)
                ? message.toolCalls
                : [];
            const active = calls.filter(
                (call) => !completedToolCallIds.has(call?.id)
            );
            if (active.length) {
                return toolCallName(active[active.length - 1]);
            }
            const content =
                typeof message.content === 'string'
                    ? message.content.trim()
                    : '';
            if (content) {
                const lastLine = content.split('\n').pop() ?? content;
                return lastLine.length > 80
                    ? `…${lastLine.slice(-80)}`
                    : lastLine;
            }
            break;
        }
        return '';
    }, [messages, completedToolCallIds]);

    // An approval card can't be acted on while collapsed, so pop the panel open
    // when one appears — the rest of the time we honor the collapsed state.
    useEffect(() => {
        if (awaitingApproval && !open) {
            useCopilotAssistantStore.getState().setOpen(true);
        }
    }, [awaitingApproval, open]);

    // Render only the conversation turns; tool-result messages are excluded.
    const messageNodes = useMemo(
        () =>
            (messages ?? [])
                .filter(
                    (message: any) =>
                        message?.role === 'user' ||
                        message?.role === 'assistant'
                )
                .map((message: any) => (
                    <MessageLine
                        key={message.id}
                        message={message}
                        completedToolCallIds={completedToolCallIds}
                    />
                )),
        [messages, completedToolCallIds]
    );

    const dim = theme.palette.text.secondary;

    // The green block cursor, blinking, used to mark live streaming output.
    const blinkingCursorSx = {
        'color': TERMINAL_PROMPT,
        'animation': 'cpkBlink 1s steps(2) infinite',
        '@keyframes cpkBlink': { '50%': { opacity: 0 } },
    };

    // Collapsed layout. Unfocused, the bar is the single activity summary line
    // (mid-response, or a prior reply to recap). Focusing reveals the prompt
    // beneath it — a second line — so the user can type without expanding. With
    // no summary yet (fresh, idle) the prompt is the only line, focused or not.
    const hasSummary = isLoading || activitySummary !== '';
    const showCollapsedPrompt =
        !isLoading && !awaitingApproval && (focused || !hasSummary);
    const collapsedTwoLine = hasSummary && showCollapsedPrompt;
    const collapsedHeight = collapsedTwoLine
        ? COLLAPSED_HEIGHT_TWO_LINE
        : COLLAPSED_HEIGHT;

    // One-line recap of what the agent is doing: an in-flight tool call or the
    // tail of the streamed reply, with the blinking cursor while it streams.
    const summaryLine = (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                py: 0.5,
                color: dim,
                userSelect: 'none',
                minWidth: 0,
            }}
        >
            <Box component="span" sx={isLoading ? blinkingCursorSx : undefined}>
                ▌
            </Box>
            <Box
                component="span"
                sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {activitySummary || 'thinking…'}
            </Box>
        </Box>
    );

    // The editable prompt line. Focus/blur drive the collapsed two-line state.
    const promptLine = (
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
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
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
    );

    // Expanded streaming hint and approval hint (collapsed shows the summary
    // line instead of these).
    const escLine = (
        <Box sx={{ display: 'flex', gap: 1, py: 0.5, userSelect: 'none' }}>
            <Box component="span" sx={blinkingCursorSx}>
                ▌
            </Box>
            <Box component="span" sx={{ color: dim }}>
                esc to interrupt
            </Box>
        </Box>
    );

    const approvalHint = (
        <Box sx={{ py: 0.5, color: dim, userSelect: 'none' }}>
            approve or cancel the request above to continue
        </Box>
    );

    return (
        <Box
            ref={outerRef}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                height: open ? expandedHeight : collapsedHeight,
                transition: dragging ? 'none' : 'height 220ms ease',
                background: theme.palette.background.default,
                borderLeft: `1px solid ${theme.palette.divider}`,
            }}
        >
            {/* Top-right corner overlay: the entity health strip alongside the
                app chrome (update alert, docs toggle) that used to live in the
                top bar. Pinned at the collapsed height so it stays put as the
                terminal expands; the text area is padded to clear it. */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    height: COLLAPSED_HEIGHT,
                    pr: 1,
                }}
            >
                {showStatus ? <EntityHealthStrip /> : null}
                <UpdateAlert />
                <SidePanelDocsOpenButton />
            </Box>

            <Box
                ref={scrollRef}
                onClick={() => {
                    // Clicking the collapsed bar reveals the prompt (focused)
                    // beneath the summary; the effect then moves the caret in.
                    if (!open) {
                        setFocused(true);
                    }
                    inputRef.current?.focus();
                }}
                sx={{
                    height: '100%',
                    // Collapsed, the panel is a fixed prompt line — lock scrolling
                    // so it can't be dragged up to reveal the transcript.
                    overflowY: open ? 'auto' : 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    pl: 2,
                    // Clear the top-right health strip so terminal text never
                    // runs underneath it.
                    pr: showStatus ? `${STATUS_AREA_WIDTH}px` : 2,
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
                    {open ? (
                        <>
                            {/* Expanded: the full transcript, then the live
                                hint or the editable prompt. */}
                            {messageNodes}
                            {isLoading
                                ? escLine
                                : awaitingApproval
                                  ? approvalHint
                                  : promptLine}
                        </>
                    ) : (
                        <>
                            {/* Collapsed: the activity summary, plus the prompt
                                only once focused (or when there's nothing to
                                summarize yet). */}
                            {hasSummary ? summaryLine : null}
                            {showCollapsedPrompt ? promptLine : null}
                        </>
                    )}
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
