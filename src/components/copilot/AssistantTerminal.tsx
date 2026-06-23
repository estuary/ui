import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    Box,
    Dialog,
    DialogContent,
    InputBase,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import { useCopilotChatHeadless_c } from '@copilotkit/react-core';

import { AssistantMarkdown } from 'src/components/copilot/AssistantMarkdown';
import { EntityHealthStrip } from 'src/components/copilot/EntityHealthStrip';
import { TERMINAL_FONT } from 'src/components/copilot/shared';
import { UpdateAlert } from 'src/components/UpdateAlert';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';

// A fully custom, headless terminal console for the assistant (driven by
// useCopilotChatHeadless_c — unlocked by the free public license key). It sits
// at the top of the content column as a single scrolling text area whose last
// line is the live prompt. Collapsed, it's a short window pinned to the bottom
// of the transcript — the newest output above the prompt — in place of the old
// top bar; expanding (Enter or Cmd/Ctrl+K) grows it downward, revealing the
// full transcript and pushing the page content down (the side nav stays put).
// Uses the app's own dark background and no separating borders, so it reads as
// part of the chrome.

// The expanded height (and the clamp applied while dragging the terminal's
// bottom edge or the breadcrumb bar) lives in the store, since the breadcrumb
// resize handle sits in a separate subtree. See useCopilotAssistantStore.

// Height of the terminal when collapsed and idle: a short window onto the bottom
// of the live transcript, showing the tail of the conversation with the input
// hidden. Sized to read like the top bar it replaces.
const COLLAPSED_HEIGHT = 48;
// Width reserved at the top-right for the entity health strip plus the chrome
// buttons; the terminal text is padded to clear it so the two never overlap.
const STATUS_AREA_WIDTH = 460;
// Collapsed height while the bar is engaged — focused, or the agent working or
// awaiting input: it grows by a line to reveal the live-line row (the editable
// prompt, or the thinking/approval status) beneath the transcript tail.
const COLLAPSED_PROMPT_LINE_HEIGHT = 21;
const COLLAPSED_STATUS_LINE_HEIGHT = 29;
// Height of the gradient that fades the transcript at an edge with content
// scrolled past it (top and/or bottom), so it dissolves rather than hard-cuts.
const SCROLL_FADE_HEIGHT = 28;
// Collapsed, the bar is only a line or two tall, so a shorter top fade dissolves
// the clipped older turns without eating into the newest line.
const COLLAPSED_FADE_HEIGHT = 20;
const TERMINAL_PROMPT = '#56d364';

// Every turn — user or agent — lays out on the same two-column grid: a
// fixed-width marker column (the user `❯` or the agent `•`, centered so the two
// share a center line) followed by the turn's text. The column width is fixed
// and identical across rows, so the markers stay aligned and every turn's text
// starts at the same x regardless of which glyph sits in the column or how big
// it is — resizing the bullet no longer drags the text column with it. Sized to
// hold the largest marker (the 1.8em bullet, ~1.8ch in the monospace face).
const turnGridSx = {
    display: 'grid',
    gridTemplateColumns: '1.9em 1fr',
    columnGap: 0.5,
    alignItems: 'start',
} as const;

// Typewriter reveal for streamed assistant text: a steady base cadence
// (~30 chars/sec at 60fps) so replies type in rather than popping in whole,
// plus a catch-up term that clears any backlog within ~3s so the reveal never
// lags far behind a fast stream or a response that lands all at once. Lower
// TYPE_CHARS_PER_FRAME to type slower; raise TYPE_MAX_LAG_FRAMES to drain
// bursts more gently.
const TYPE_CHARS_PER_FRAME = 0.5;
const TYPE_MAX_LAG_FRAMES = 180;
const WELCOME_TYPE_DELAY_MS = 2000;

// Reveals `text` a few characters per frame so streamed assistant output types
// in. While the model is still producing tokens the target grows; the reveal
// catches up to it and keeps going after streaming stops until the full text is
// shown. Messages that are already complete when first rendered (transcript
// history) mount fully revealed and never animate.
function useTypewriter(
    text: string,
    animate: boolean,
    startDelayMs = 0
): string {
    const [revealed, setRevealed] = useState(() => (animate ? 0 : text.length));
    const revealedRef = useRef(revealed);
    revealedRef.current = revealed;
    // Once a message has begun streaming we keep typing it to the end even after
    // `animate` flips false (the model finished), so the tail still types in
    // rather than snapping to full.
    const startedRef = useRef(animate);
    if (animate) {
        startedRef.current = true;
    }

    useEffect(() => {
        if (!startedRef.current || revealedRef.current >= text.length) {
            return undefined;
        }
        let frame = 0;
        let timeout = 0;
        const tick = () => {
            const remaining = text.length - revealedRef.current;
            if (remaining <= 0) {
                return;
            }
            // No Math.ceil here: rounding up forces a floor of 1 char/frame
            // (~60 chars/sec), which would override the fractional base cadence
            // and pin the reveal speed regardless of the constants. `revealed`
            // accumulates as a float and text.slice() truncates it for display.
            const step = Math.max(
                TYPE_CHARS_PER_FRAME,
                remaining / TYPE_MAX_LAG_FRAMES
            );
            setRevealed((current) => Math.min(text.length, current + step));
            frame = window.requestAnimationFrame(tick);
        };
        const start = () => {
            frame = window.requestAnimationFrame(tick);
        };

        if (startDelayMs > 0 && revealedRef.current === 0) {
            timeout = window.setTimeout(start, startDelayMs);
        } else {
            start();
        }

        return () => {
            window.clearTimeout(timeout);
            window.cancelAnimationFrame(frame);
        };
    }, [text, startDelayMs]);

    return startedRef.current ? text.slice(0, revealed) : text;
}

// Tool calls that need explicit human approval keep their interactive card.
// Every other (read-only) tool call renders as a plain inline text line rather
// than a status card, so the transcript reads like terminal output.
const HITL_ACTIONS = new Set([
    'runGraphQLMutation',
    'runSetupSql',
    'collectConnectorConfig',
]);

// Short, human labels for the transcript pointer shown while a form is hosted in
// the side panel (see MessageLine's pending marker).
const HITL_LABELS: Record<string, string> = {
    runGraphQLMutation: 'account change',
    runSetupSql: 'setup SQL',
    collectConnectorConfig: 'connector setup',
};

const TOOL_LABELS: Record<string, string> = {
    lookupEstuaryDocs: 'Search docs',
    searchEstuaryKnowledge: 'Search knowledge',
};

const HIDDEN_TOOL_CALLS = new Set(['searchEstuaryKnowledge']);

const toolCallName = (call: any): string =>
    call?.function?.name ?? call?.name ?? 'tool call';

const WELCOME_MESSAGE = {
    id: 'assistant-welcome',
    role: 'assistant',
    content: 'Hey, what can I help you with?',
};

// Renders a single chat message terminal-style: user turns as a `❯` prompt line,
// assistant turns as plain output, and tool calls as muted transcript entries.
function MessageLine({
    message,
    markPending,
    showAgentBullet,
    completedToolCallIds,
    animateText,
    typewriterDelayMs = 0,
    onReveal,
}: {
    message: any;
    // The live HITL form is hosted in the side panel (wide viewports), so leave a
    // muted pointer in the transcript while it awaits input. Narrow viewports use
    // a modal that's self-evident, so no pointer is shown there.
    markPending: boolean;
    showAgentBullet: boolean;
    completedToolCallIds: Set<string>;
    // True for assistant text that should type in. False for finished turns and
    // user turns, which render whole.
    animateText: boolean;
    typewriterDelayMs?: number;
    // Called after each reveal so the transcript can follow the growing text
    // while it's pinned to the bottom.
    onReveal: () => void;
}) {
    const theme = useTheme();
    const content = typeof message?.content === 'string' ? message.content : '';
    const isUser = message?.role === 'user';
    // Type assistant turns in; user turns render whole. The reveal grows the
    // line's height, so re-pin the transcript after each step.
    const displayed = useTypewriter(
        content,
        !isUser && animateText,
        typewriterDelayMs
    );
    useLayoutEffect(() => {
        onReveal();
    }, [displayed, onReveal]);
    const toolCalls: any[] = Array.isArray(message?.toolCalls)
        ? message.toolCalls
        : [];
    const visibleToolCalls = toolCalls.filter(
        (call) => !HIDDEN_TOOL_CALLS.has(toolCallName(call))
    );
    if (!content && visibleToolCalls.length === 0) {
        return null;
    }

    if (isUser) {
        return (
            <Box
                sx={{
                    ...turnGridSx,
                    // my: 1,
                    // Subtly band each past prompt so the user's turns read as
                    // distinct from the agent's output while scrolling history.
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.text.primary,
                }}
            >
                <Box
                    component="span"
                    sx={{
                        justifySelf: 'center',
                        color: TERMINAL_PROMPT,
                        userSelect: 'none',
                    }}
                >
                    ❯
                </Box>
                <Box
                    component="span"
                    sx={{
                        minWidth: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {content}
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                ...turnGridSx,
                py: 0.5,
                lineHeight: 1.45,
                color: theme.palette.text.primary,
            }}
        >
            {/* A bullet marks each agent turn, centered in the shared marker
                column so it lines up with the user prompt's `❯` above and below
                it. The top margin optically centers the oversized glyph on the
                first line of text. */}
            {showAgentBullet ? (
                <Box
                    component="span"
                    sx={{
                        justifySelf: 'center',
                        mt: -0.1,
                        fontSize: '1.8em',
                        lineHeight: 1,
                        color: theme.palette.text.primary,
                        userSelect: 'none',
                    }}
                >
                    •
                </Box>
            ) : (
                <Box component="span" aria-hidden />
            )}
            <Box sx={{ minWidth: 0 }}>
                {displayed ? (
                    <AssistantMarkdown>{displayed}</AssistantMarkdown>
                ) : null}
                {visibleToolCalls.map((call, index) => {
                    const name = toolCallName(call);
                    const completed = completedToolCallIds.has(call?.id);
                    const label =
                        TOOL_LABELS[name] ?? HITL_LABELS[name] ?? name;
                    const pendingHitl =
                        markPending && HITL_ACTIONS.has(name) && !completed;

                    return (
                        <Box
                            key={call?.id ?? `${name}-${index}`}
                            sx={{
                                mt: content || index > 0 ? 1 : 0,
                                color: theme.palette.text.disabled,
                                userSelect: 'none',
                            }}
                        >
                            {completed ? '✓' : '▸'} {label}
                            {pendingHitl
                                ? ' — complete the form on the right to continue'
                                : null}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export default function AssistantTerminal() {
    const theme = useTheme();
    // The health strip needs some horizontal room; hide it (and drop the reserved
    // padding) below `md`. The HITL side panel needs more, so it has a separate,
    // higher breakpoint — see `usePanel` below.
    const showStatus = useMediaQuery(theme.breakpoints.up('md'));
    const open = useCopilotAssistantStore((state) => state.open);
    const pendingPrompt = useCopilotAssistantStore(
        (state) => state.pendingPrompt
    );
    const clearPendingPrompt = useCopilotAssistantStore(
        (state) => state.clearPendingPrompt
    );
    const pendingFreshPrompt = useCopilotAssistantStore(
        (state) => state.pendingFreshPrompt
    );
    const clearPendingFreshPrompt = useCopilotAssistantStore(
        (state) => state.clearPendingFreshPrompt
    );
    // Expanded height and the in-progress-resize flag are shared so the
    // breadcrumb bar (a separate subtree) can resize the terminal too.
    const expandedHeight = useCopilotAssistantStore(
        (state) => state.expandedHeight
    );
    const resizing = useCopilotAssistantStore(
        (state) => state.resizingTerminal
    );
    const setExpandedHeight = useCopilotAssistantStore(
        (state) => state.setExpandedHeight
    );
    const setResizingTerminal = useCopilotAssistantStore(
        (state) => state.setResizingTerminal
    );
    const kapaSearchInFlight = useCopilotAssistantStore(
        (state) => state.kapaSearchInFlight
    );

    // The system prompt is injected by the runtime (server.mjs), not the client,
    // so it stays out of the bundle and can't be stripped — no instructions are
    // sent from here.
    const { messages, sendMessage, isLoading, stopGeneration, isAvailable } =
        useCopilotChatHeadless_c();
    const assistantWorking = isLoading || kapaSearchInFlight;

    const [draft, setDraft] = useState('');
    // Whether the collapsed prompt is focused. Drives only the bar's cursor
    // affordance — a pointer when blurred, signalling "click to type".
    const [focused, setFocused] = useState(false);
    // Whether the transcript has content scrolled past the top/bottom edge —
    // each edge fades only while it hides something, so the pinned newest line
    // (and the prompt below it) stay crisp.
    const [fadeTop, setFadeTop] = useState(false);
    const [fadeBottom, setFadeBottom] = useState(false);
    // Measured width of the status overlay; the transcript reserves this much on
    // the right rather than a fixed amount. Falls back to the full reserve until
    // measured so text never starts underneath it.
    const [statusWidth, setStatusWidth] = useState(STATUS_AREA_WIDTH);
    const outerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    // The side-panel HITL host and its content; the terminal grows to fit the
    // measured form so the whole thing is visible without scrolling.
    const hitlPanelRef = useRef<HTMLDivElement>(null);
    const hitlContentRef = useRef<HTMLDivElement>(null);
    // The expanded height before a form took over, restored when it closes; and
    // whether the user resized mid-form, in which case auto-fit/restore back off.
    const preHitlHeightRef = useRef<number | null>(null);
    const userResizedDuringHitlRef = useRef(false);
    // The top-right status overlay (health strip + chrome); its measured width
    // sets how much right-edge room the transcript reserves, so the terminal text
    // reclaims whatever the overlay doesn't use (notably when it stacks narrow).
    const statusRef = useRef<HTMLDivElement>(null);
    // Whether the transcript is scrolled to (near) the bottom. We only auto-pin
    // to the newest line while this holds, so scrolling up to read history isn't
    // yanked back down by each streamed token.
    const atBottomRef = useRef(true);
    // A collapsed transcript click/drag can blur the textarea before the click
    // handler decides whether to refocus it. Keep the terminal's focused visual
    // state stable during that interaction without preventing native text
    // selection.
    const mouseDownInCollapsedTranscriptRef = useRef(false);

    const updateFades = useCallback(() => {
        const node = scrollRef.current;
        if (!node) {
            return;
        }
        const { scrollTop, scrollHeight, clientHeight } = node;
        const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
        atBottomRef.current = distanceFromBottom <= 4;
        setFadeTop(scrollTop > 4);
        setFadeBottom(distanceFromBottom > 4);
    }, []);

    // Follow the newest line as the typewriter reveals more text. Collapsed, the
    // transcript can't be scrolled, so always pin it to the bottom; expanded,
    // only while the user is already at the bottom, so reading history isn't
    // yanked down.
    const pinToBottom = useCallback(() => {
        const node = scrollRef.current;
        const collapsed = !useCopilotAssistantStore.getState().open;
        if (node && (collapsed || atBottomRef.current)) {
            node.scrollTop = node.scrollHeight;
        }
    }, []);

    // Drag the bottom edge to resize the expanded panel; the store clamps the
    // height to its allowed range.
    const startDrag = (event: React.MouseEvent) => {
        event.preventDefault();
        const top = outerRef.current?.getBoundingClientRect().top ?? 0;
        setResizingTerminal(true);

        const onMove = (moveEvent: MouseEvent) => {
            setExpandedHeight(moveEvent.clientY - top);
        };
        const onUp = () => {
            setResizingTerminal(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // Follow the newest line as messages stream. Collapsed, the transcript can't
    // be scrolled, so always pin it to the bottom; expanded, only while the user
    // is already at the bottom, so scrolling up to read history stays put.
    useEffect(() => {
        const node = scrollRef.current;
        if (node && (!open || atBottomRef.current)) {
            node.scrollTop = node.scrollHeight;
        }
        updateFades();
    }, [messages, assistantWorking, open, updateFades]);

    // Keep the transcript pinned to its newest line while the bar's height
    // animates. The CSS height transition resizes the viewport continuously
    // without firing scroll events, so re-pin every frame for the length of the
    // transition, instead of letting the view drift mid-transcript. This fires on
    // any expand/collapse, and — while collapsed — when the live-line row reveals
    // or hides with focus or the agent's activity. Expanded, focus/activity
    // changes are ignored so scrolling up to read history isn't yanked back down.
    const prevOpenRef = useRef(open);
    useEffect(() => {
        const openChanged = prevOpenRef.current !== open;
        prevOpenRef.current = open;
        if (open && !openChanged) {
            return undefined;
        }
        const node = scrollRef.current;
        if (!node) {
            return undefined;
        }
        let frame = 0;
        let startedAt = 0;
        const pin = (now: number) => {
            if (!startedAt) {
                startedAt = now;
            }
            node.scrollTop = node.scrollHeight;
            if (now - startedAt < 240) {
                frame = window.requestAnimationFrame(pin);
            } else {
                updateFades();
            }
        };
        frame = window.requestAnimationFrame(pin);
        return () => window.cancelAnimationFrame(frame);
    }, [open, focused, assistantWorking, updateFades]);

    // Recompute the edge fades on mount and when the viewport resizes (the
    // transcript may start or stop overflowing).
    useEffect(() => {
        updateFades();
        window.addEventListener('resize', updateFades);
        return () => window.removeEventListener('resize', updateFades);
    }, [updateFades]);

    useEffect(() => {
        if (!focused || open) {
            return undefined;
        }
        const onMouseDown = (event: MouseEvent) => {
            const target = event.target;
            if (target instanceof Node && outerRef.current?.contains(target)) {
                return;
            }
            mouseDownInCollapsedTranscriptRef.current = false;
            setFocused(false);
        };
        document.addEventListener('mousedown', onMouseDown, true);
        return () =>
            document.removeEventListener('mousedown', onMouseDown, true);
    }, [focused, open]);

    useEffect(() => {
        if (open && !assistantWorking) {
            const id = window.setTimeout(
                () => inputRef.current?.focus({ preventScroll: true }),
                240
            );
            return () => window.clearTimeout(id);
        }
        return undefined;
    }, [open, assistantWorking]);

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
    // pendingPrompt; send them through the headless chat the panel renders.
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

    // "Get help" on an error queues a prompt and bumps threadNonce to remount the
    // provider for a clean thread — so this terminal remounts with it. Send the
    // prompt once the fresh runtime session is ready: a send fired before
    // isAvailable is silently dropped. The ref guards StrictMode's double-effect
    // and resets on the remount, which is exactly when the next help request
    // starts.
    const freshPromptSent = useRef(false);
    useEffect(() => {
        if (!pendingFreshPrompt || freshPromptSent.current || !isAvailable) {
            return;
        }
        freshPromptSent.current = true;
        void sendMessage({
            id: crypto.randomUUID(),
            role: 'user',
            content: pendingFreshPrompt,
        } as any);
        clearPendingFreshPrompt();
    }, [pendingFreshPrompt, isAvailable, sendMessage, clearPendingFreshPrompt]);

    const runSlashCommand = (text: string): boolean => {
        const [command] = text.trim().split(/\s+/, 1);

        switch (command?.toLowerCase()) {
            case '/clear':
                useCopilotAssistantStore.getState().clearChatContext();
                return true;
            default:
                return false;
        }
    };

    const submit = () => {
        const text = draft.trim();
        if (!text || assistantWorking) {
            return;
        }
        setDraft('');
        if (runSlashCommand(text)) {
            return;
        }
        // The reply streams into the transcript above; the live indicator stands
        // in for the prompt while it streams, and the prompt returns when it's
        // done.
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
    // The most recent HITL tool call still awaiting a result, if any. While one
    // exists the input is blocked (sending a new prompt would strand the
    // unanswered tool call and error the run) and — on wide viewports — its form
    // is hosted in the side panel.
    const pendingApproval = useMemo(() => {
        const list = messages ?? [];
        for (let i = list.length - 1; i >= 0; i -= 1) {
            const message: any = list[i];
            const calls: any[] = Array.isArray(message?.toolCalls)
                ? message.toolCalls
                : [];
            const pendingCall = calls.find(
                (call) =>
                    HITL_ACTIONS.has(toolCallName(call)) &&
                    !completedToolCallIds.has(call?.id)
            );
            if (pendingCall) {
                return { message, name: toolCallName(pendingCall) };
            }
        }
        return null;
    }, [messages, completedToolCallIds]);

    const awaitingApproval = pendingApproval != null;

    // The pending form is hosted in one place at a time: the side panel when
    // there's room for it (wide viewport AND the terminal expanded), otherwise a
    // modal — covering narrower viewports and the collapsed terminal, where the
    // panel would be clipped to the bar height. It's never rendered inline in the
    // transcript. The panel needs more width than the health strip does, so it
    // has its own (higher) breakpoint: the strip shows from `md`, the form only
    // earns the side panel from `lg` and falls back to the modal below that.
    const usePanel = useMediaQuery(theme.breakpoints.up('lg'));
    const pendingApprovalUI = pendingApproval
        ? pendingApproval.message?.generativeUI?.()
        : null;
    const showFormInPanel = usePanel && open && pendingApprovalUI != null;
    const showFormInModal = pendingApprovalUI != null && !showFormInPanel;

    // When the side-panel form appears, remember the terminal height so it can be
    // restored once the form closes; the auto-fit effect below grows the terminal
    // to the form from there. On close, restore the prior height — unless the user
    // resized mid-form, in which case leave their size alone. (When there's no
    // room for the panel — narrow viewport or collapsed terminal — the form is
    // hosted in a modal, which manages itself; the terminal is left untouched.)
    const wasShowingPanelForm = useRef(false);
    useEffect(() => {
        const store = useCopilotAssistantStore.getState();
        if (showFormInPanel && !wasShowingPanelForm.current) {
            preHitlHeightRef.current = store.expandedHeight;
            userResizedDuringHitlRef.current = false;
        } else if (!showFormInPanel && wasShowingPanelForm.current) {
            if (
                preHitlHeightRef.current != null &&
                !userResizedDuringHitlRef.current
            ) {
                store.setExpandedHeight(preHitlHeightRef.current);
            }
            preHitlHeightRef.current = null;
        }
        wasShowingPanelForm.current = showFormInPanel;
    }, [showFormInPanel]);

    // If the user drags the resize handle while the panel form is up, they've
    // taken over the height — stop auto-fitting and don't restore on close.
    useEffect(() => {
        if (resizing && showFormInPanel) {
            userResizedDuringHitlRef.current = true;
        }
    }, [resizing, showFormInPanel]);

    // Grow the terminal to fit the panel-hosted form as it renders (the connector
    // form, for one, streams its fields in after the schema loads). Grow-only:
    // the store clamps to a max height, past which the panel scrolls; shrinking
    // back is left to the close-restore above so the terminal doesn't twitch as
    // the form changes.
    useEffect(() => {
        if (!showFormInPanel) {
            return undefined;
        }
        const content = hitlContentRef.current;
        if (!content || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const fit = () => {
            if (userResizedDuringHitlRef.current) {
                return;
            }
            const panel = hitlPanelRef.current;
            const store = useCopilotAssistantStore.getState();
            if (panel && panel.scrollHeight > store.expandedHeight + 1) {
                store.setExpandedHeight(panel.scrollHeight);
            }
        };
        const observer = new ResizeObserver(fit);
        observer.observe(content);
        fit();
        return () => observer.disconnect();
    }, [showFormInPanel]);

    // Track the status overlay's actual width so the transcript reserves only as
    // much right-edge room as it needs — the strip is much narrower stacked
    // (expanded) than in a row (collapsed), and that freed width goes to the
    // terminal text. The side-panel form keeps the full reserve, so skip measuring
    // then. Measured in a layout effect so the first paint already has the right
    // padding (no reflow on mount).
    useLayoutEffect(() => {
        if (showFormInPanel || !showStatus) {
            return undefined;
        }
        const node = statusRef.current;
        if (!node || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const measure = () => setStatusWidth(node.offsetWidth);
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        measure();
        return () => observer.disconnect();
    }, [showFormInPanel, showStatus]);

    // The assistant message the model is actively streaming — the last turn,
    // when it's an assistant turn and a response is in flight. Only this one
    // types in; every earlier turn is already complete and renders whole.
    const streamingMessageId = useMemo(() => {
        if (!assistantWorking) {
            return null;
        }
        const list = messages ?? [];
        const last = list[list.length - 1];
        return last?.role === 'assistant' ? last.id : null;
    }, [messages, assistantWorking]);

    // Render only the conversation turns; tool-result messages are excluded. The
    // welcome row is UI-only: it gives the collapsed empty terminal an agent
    // message to show without adding anything to CopilotKit's chat context.
    const messageNodes = useMemo(() => {
        const conversationMessages = (messages ?? []).filter(
            (message: any) =>
                message?.role === 'user' || message?.role === 'assistant'
        );
        const welcomeWithoutHistory = conversationMessages.length === 0;
        const displayMessages = [WELCOME_MESSAGE, ...conversationMessages];

        return displayMessages.map((message: any) => (
            <MessageLine
                key={message.id}
                message={message}
                markPending={usePanel}
                showAgentBullet={open}
                completedToolCallIds={completedToolCallIds}
                animateText={
                    message.id === streamingMessageId ||
                    (message.id === WELCOME_MESSAGE.id && welcomeWithoutHistory)
                }
                typewriterDelayMs={
                    message.id === WELCOME_MESSAGE.id && welcomeWithoutHistory
                        ? WELCOME_TYPE_DELAY_MS
                        : 0
                }
                onReveal={pinToBottom}
            />
        ));
    }, [
        messages,
        usePanel,
        open,
        completedToolCallIds,
        streamingMessageId,
        pinToBottom,
    ]);

    const dim = theme.palette.text.disabled;

    // The green block cursor, blinking, used to mark live streaming output.
    const blinkingCursorSx = {
        'color': TERMINAL_PROMPT,
        'animation': 'cpkBlink 1s steps(2) infinite',
        '@keyframes cpkBlink': { '50%': { opacity: 0 } },
    };

    // Collapsed, the terminal is a window onto the bottom of the live transcript;
    // the full history stays mounted and pinned to its newest line. The live-line
    // row (the prompt, or the thinking/approval status) reveals only while the bar
    // is engaged — focused, or the agent working or awaiting approval — or when
    // there's no transcript yet, so the prompt is the only thing to show. Idle and
    // blurred it collapses away: the bar shrinks and the page content rises over
    // where the input was, leaving just the transcript tail.
    const hasTranscript = messageNodes.length > 0;
    const liveLineRevealed =
        open ||
        focused ||
        assistantWorking ||
        awaitingApproval ||
        !hasTranscript;
    // Two lines only when the transcript tail and the live-line row both show; a
    // single line otherwise (just the tail when blurred, or just the prompt when
    // there's no transcript yet).
    const collapsedLiveLineHeight =
        assistantWorking || awaitingApproval
            ? COLLAPSED_STATUS_LINE_HEIGHT
            : COLLAPSED_PROMPT_LINE_HEIGHT;
    const collapsedHeight =
        hasTranscript && liveLineRevealed
            ? COLLAPSED_HEIGHT + collapsedLiveLineHeight
            : COLLAPSED_HEIGHT;

    // Fade the transcript into the background at any edge hiding scrolled-past
    // content. Expanded, fade whichever edge is hiding content. Collapsed, the
    // bar shows the bottom slice of the transcript pinned to its newest line, so
    // always dissolve the top edge where the older turns clip away while keeping
    // the bottom (the prompt) crisp.
    const fade = `${SCROLL_FADE_HEIGHT}px`;
    const fadeMask = open
        ? `linear-gradient(to bottom, ${
              fadeTop ? 'transparent' : '#000'
          }, #000 ${fade}, #000 calc(100% - ${fade}), ${
              fadeBottom ? 'transparent' : '#000'
          })`
        : `linear-gradient(to bottom, transparent, #000 ${COLLAPSED_FADE_HEIGHT}px)`;

    // The editable prompt line. Focus/blur drive the collapsed bar's cursor.
    const promptLine = (
        <Box sx={{ ...turnGridSx }}>
            <Box
                component="span"
                sx={{
                    justifySelf: 'center',
                    // Stay top-aligned with the first line as the input grows
                    // to multiple rows.
                    alignSelf: 'start',
                    color: TERMINAL_PROMPT,
                    userSelect: 'none',
                }}
            >
                ❯
            </Box>
            <InputBase
                inputRef={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                    if (mouseDownInCollapsedTranscriptRef.current) {
                        return;
                    }
                    setFocused(false);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        submit();
                    }
                }}
                multiline
                maxRows={6}
                sx={{
                    'minWidth': 0,
                    'color': theme.palette.text.primary,
                    'fontFamily': TERMINAL_FONT,
                    'fontSize': 13,
                    'lineHeight': 1.6,
                    // p:0 only zeroes the InputBase root; the inner input element
                    // carries its own default `padding: 4px 0 5px`, which would
                    // make the prompt line ~9px taller than one text line and
                    // overflow the two-line collapsed height. Zero it too.
                    'p': 0,
                    '& .MuiInputBase-input': {
                        p: 0,
                    },
                }}
            />
        </Box>
    );

    // The working indicator and approval hint that share the live-line row with
    // the prompt. A steady status with the blinking cursor stands in for
    // read-only work — regular model/tool activity is "thinking", while the Kapa
    // knowledge-base tool gets a more specific search label.
    const workingLabel = kapaSearchInFlight ? 'searching...' : 'thinking...';
    const thinkingLine = (
        <Box
            sx={{
                ...turnGridSx,
                py: 0.5,
                userSelect: 'none',
                color: theme.palette.text.secondary,
            }}
        >
            <Box
                component="span"
                sx={{ ...blinkingCursorSx, justifySelf: 'center' }}
            >
                ▌
            </Box>
            <Box component="span">
                {workingLabel}
                {isLoading ? (
                    <Box component="span" sx={{ color: dim, ml: 1 }}>
                        esc to interrupt
                    </Box>
                ) : null}
            </Box>
        </Box>
    );

    const approvalHint = (
        <Box sx={{ py: 0.5, color: dim, userSelect: 'none' }}>
            {usePanel
                ? 'complete the form on the right to continue'
                : 'complete the form to continue'}
        </Box>
    );

    return (
        <>
            <Box
                ref={outerRef}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: open ? expandedHeight : collapsedHeight,
                    transition: resizing ? 'none' : 'height 220ms ease',
                    background: theme.palette.background.default,
                }}
            >
                {showFormInPanel ? (
                    /* A HITL form is awaiting input — host it in the side panel,
                   temporarily replacing the entity health strip and chrome. It
                   fills the reserved right-hand column (the transcript text is
                   already padded clear of it) and scrolls within the expanded
                   terminal. */
                    <Box
                        ref={hitlPanelRef}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: STATUS_AREA_WIDTH,
                            zIndex: 1,
                            overflowY: 'auto',
                            px: 1.5,
                            py: 1,
                            borderLeft: `1px solid ${theme.palette.divider}`,
                            background: theme.palette.background.default,
                        }}
                    >
                        <Box ref={hitlContentRef}>{pendingApprovalUI}</Box>
                    </Box>
                ) : (
                    /* Top-right window overlay: the entity health strip alongside
                   the app chrome (update alert) that used to live in the top
                   bar. It stays pinned to the viewport as the terminal expands;
                   the text area is padded to clear it. */
                    <Box
                        ref={statusRef}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: (theme) => theme.zIndex.appBar + 1,
                            display: 'flex',
                            alignItems: open ? 'flex-start' : 'center',
                            gap: 1,
                            height: open ? 'auto' : COLLAPSED_HEIGHT,
                            // pt: open ? 1 : 0,
                            pr: 1,
                            // Hug the content so its measured width (which sets the
                            // transcript's right reserve) is only what's needed.
                            width: 'fit-content',
                        }}
                    >
                        {showStatus ? (
                            <EntityHealthStrip vertical={open} />
                        ) : null}
                        <UpdateAlert />
                    </Box>
                )}

                <Box
                    ref={scrollRef}
                    onMouseDown={(event) => {
                        mouseDownInCollapsedTranscriptRef.current =
                            !open &&
                            focused &&
                            event.target !== inputRef.current;
                    }}
                    onScroll={updateFades}
                    onClick={() => {
                        mouseDownInCollapsedTranscriptRef.current = false;
                        // A drag to select transcript text also fires a click on
                        // release; focusing the input then would move the caret into
                        // it and clear the selection. Leave focus alone when the user
                        // has just selected something.
                        if (window.getSelection()?.toString()) {
                            return;
                        }
                        // Clicking anywhere on the collapsed bar drops the caret into
                        // the prompt. preventScroll keeps the click from scrolling the
                        // transcript: it's already pinned to the bottom where the
                        // prompt sits.
                        if (!open) {
                            setFocused(true);
                        }
                        inputRef.current?.focus({ preventScroll: true });
                    }}
                    sx={{
                        height: '100%',
                        // Collapsed and blurred, the whole bar is a click target that
                        // reveals the prompt, so flag it with a pointer; once focused
                        // or expanded it's a text surface and keeps its natural cursor
                        // (caret in the input, text selection in the transcript).
                        cursor: !open && !focused ? 'pointer' : undefined,
                        // Collapsed, the panel is a fixed prompt line — lock scrolling
                        // so it can't be dragged up to reveal the transcript.
                        overflowY: open ? 'auto' : 'hidden',
                        // overflowY: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        // Clear the top-right health strip so terminal text never
                        // runs underneath it.
                        pr: showFormInPanel
                            ? `${STATUS_AREA_WIDTH}px`
                            : showStatus
                              ? `${statusWidth + 16}px`
                              : 2,
                        py: 1.25,
                        // Dissolve the transcript at edges that hide scrolled content.
                        maskImage: fadeMask,
                        WebkitMaskImage: fadeMask,
                        fontFamily: TERMINAL_FONT,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: theme.palette.text.primary,
                        // backgroundColor: 'darkgreen',
                    }}
                >
                    {/* The content is bottom-anchored: a short transcript sits at
                    the bottom edge, and collapsing rides the newest line down with
                    the shrinking panel. The full message history is always mounted
                    — collapsed, the bar clips it to a short window pinned to the
                    bottom. */}
                    <Box sx={{ mt: 'auto', flexShrink: 0 }}>
                        {messageNodes}
                        {/* The live-line row: the thinking indicator, the approval
                        hint, or the editable prompt. It reveals/hides by animating
                        its grid row between full and zero height, in step with the
                        bar's own height — so collapsing then blurring slides the
                        prompt out of view (and raises the page content over where
                        it was) rather than dropping it abruptly. Expanded, and
                        whenever the agent is working, it stays revealed. */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateRows: liveLineRevealed
                                    ? '1fr'
                                    : '0fr',
                                transition: resizing
                                    ? 'none'
                                    : 'grid-template-rows 220ms ease',
                            }}
                        >
                            <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
                                {assistantWorking
                                    ? thinkingLine
                                    : awaitingApproval
                                      ? approvalHint
                                      : promptLine}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {open ? (
                    <Box
                        onMouseDown={startDrag}
                        sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 6,
                            cursor: 'ns-resize',
                            zIndex: 2,
                        }}
                    />
                ) : null}
            </Box>

            {/* Narrow viewports have no room for the side panel, so a pending form is
            hosted in a modal instead. It can't be dismissed by backdrop/escape —
            the tool call needs an answer — so the user resolves it via the form's
            own controls (each form has a Cancel); it closes when the form
            responds and the pending tool call clears. */}
            <Dialog
                open={showFormInModal}
                disableEscapeKeyDown
                maxWidth="sm"
                fullWidth
            >
                <DialogContent sx={{ p: 1.5 }}>
                    {showFormInModal ? pendingApprovalUI : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
