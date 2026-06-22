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

// The expanded height (and the clamp applied while dragging the terminal's
// bottom edge or the breadcrumb bar) lives in the store, since the breadcrumb
// resize handle sits in a separate subtree. See useCopilotAssistantStore.

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
// Height of the gradient that fades the transcript at an edge with content
// scrolled past it (top and/or bottom), so it dissolves rather than hard-cuts.
const SCROLL_FADE_HEIGHT = 28;
const TERMINAL_PROMPT = '#56d364';

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

const toolCallName = (call: any): string =>
    call?.function?.name ?? call?.name ?? 'tool call';

// Renders a single chat message terminal-style: user turns as a `❯` prompt line,
// assistant turns as plain output. Read-only tool calls are not shown — the
// steady "thinking…" indicator stands in for them; only approval-required tool
// calls surface, via their interactive card.
function MessageLine({
    message,
    markPending,
    completedToolCallIds,
}: {
    message: any;
    // The live HITL form is hosted in the side panel (wide viewports), so leave a
    // muted pointer in the transcript while it awaits input. Narrow viewports use
    // a modal that's self-evident, so no pointer is shown there.
    markPending: boolean;
    completedToolCallIds: Set<string>;
}) {
    const theme = useTheme();
    const content = typeof message?.content === 'string' ? message.content : '';
    const isUser = message?.role === 'user';
    const toolCalls: any[] = Array.isArray(message?.toolCalls)
        ? message.toolCalls
        : [];
    const hitlCalls = toolCalls.filter((call) =>
        HITL_ACTIONS.has(toolCallName(call))
    );
    const pendingHitl = hitlCalls.some(
        (call) => !completedToolCallIds.has(call?.id)
    );

    const pendingMarker =
        markPending && pendingHitl
            ? (HITL_LABELS[toolCallName(hitlCalls[0])] ?? 'a request')
            : null;

    if (!content && !pendingMarker) {
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
            {content ? <AssistantMarkdown>{content}</AssistantMarkdown> : null}
            {pendingMarker ? (
                <Box
                    sx={{
                        mt: content ? 1 : 0,
                        color: theme.palette.text.disabled,
                        userSelect: 'none',
                    }}
                >
                    ▸ {pendingMarker} — complete the form on the right to
                    continue
                </Box>
            ) : null}
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

    // The system prompt is injected by the runtime (server.mjs), not the client,
    // so it stays out of the bundle and can't be stripped — no instructions are
    // sent from here.
    const { messages, sendMessage, isLoading, stopGeneration } =
        useCopilotChatHeadless_c();

    const [draft, setDraft] = useState('');
    // Collapsed, the bar shows just the agent activity summary until the user
    // focuses it; focusing reveals the prompt line beneath the summary.
    const [focused, setFocused] = useState(false);
    // Whether a collapse has finished animating. While the panel is resizing
    // between sizes the content stays bottom-anchored (rides smoothly with the
    // moving edge); once settled and collapsed it flips to top-anchored so the
    // focus/submit reveals slide the prompt in beneath the summary. See `mt` on
    // the content box.
    const [collapseSettled, setCollapseSettled] = useState(true);
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

    // Follow the newest line as messages stream — but only while the user is
    // already at the bottom, so scrolling up to read history stays put.
    useEffect(() => {
        const node = scrollRef.current;
        if (node && atBottomRef.current) {
            node.scrollTop = node.scrollHeight;
        }
        updateFades();
    }, [messages, isLoading, open, updateFades]);

    // Keep the transcript pinned to its newest line while the panel animates
    // between sizes. The CSS height transition resizes the viewport continuously
    // without firing scroll events, so re-pin every frame for the length of the
    // transition: collapsing then clips the older turns up and away behind the
    // shrinking top edge while the newest line and the prompt ride the bottom
    // down, instead of the view drifting mid-transcript.
    useEffect(() => {
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
    }, [open, updateFades]);

    // Track when a size change has settled so the content can switch anchoring
    // (see `mt` on the content box). Any open/collapse toggle marks the panel
    // as animating; a collapse then settles once its height transition lands.
    // Expanding stays bottom-anchored throughout, so it never re-settles.
    useEffect(() => {
        setCollapseSettled(false);
        if (open) {
            return undefined;
        }
        const id = window.setTimeout(() => setCollapseSettled(true), 240);
        return () => window.clearTimeout(id);
    }, [open]);

    // Recompute the edge fades on mount and when the viewport resizes (the
    // transcript may start or stop overflowing).
    useEffect(() => {
        updateFades();
        window.addEventListener('resize', updateFades);
        return () => window.removeEventListener('resize', updateFades);
    }, [updateFades]);

    useEffect(() => {
        if (open && !isLoading) {
            const id = window.setTimeout(
                () => inputRef.current?.focus({ preventScroll: true }),
                240
            );
            return () => window.clearTimeout(id);
        }
        return undefined;
    }, [open, isLoading]);

    // Expanding clears the collapsed focus state and hands the caret to the
    // effect above, which focuses the expanded input once the panel settles.
    // Collapsing leaves `focused` untouched: closing the panel while the prompt
    // is focused keeps the bar in its two-line shape so the user can keep
    // typing, and the effect below restores the caret after the collapsed
    // prompt remounts.
    useEffect(() => {
        if (open) {
            setFocused(false);
        }
    }, [open]);

    // Move the caret into the collapsed prompt whenever the bar is focused and
    // closed. This covers two paths: focusing the collapsed bar (its grid row
    // reveals and the caret drops in), and collapsing a panel whose prompt was
    // focused — the prompt remounts in the collapsed grid once the height
    // settles, dropping DOM focus, so re-running on collapseSettled restores it.
    // preventScroll keeps the bar's height animation in charge of the reveal;
    // without it the browser scrolls the still-offscreen input into view and
    // snaps the summary up before the panel finishes growing.
    useEffect(() => {
        if (focused && !open) {
            const id = window.setTimeout(
                () => inputRef.current?.focus({ preventScroll: true }),
                0
            );
            return () => window.clearTimeout(id);
        }
        return undefined;
    }, [focused, open, collapseSettled]);

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
        // Stay engaged after sending. Keeping focus holds the collapsed bar in
        // its two-line shape — the prompt on the bottom line — while the reply
        // streams into the summary line above it, so submitting slides the
        // response in above the prompt instead of dropping back to one line.
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

    // A one-line recap of the latest assistant text, shown on the collapsed
    // prompt line in place of the input while a response streams. Tool calls are
    // deliberately not summarized — when the agent is working but hasn't produced
    // text yet this returns '' and the bar falls back to the "thinking…"
    // indicator. The line is returned whole; the summary box trims it with a
    // trailing ellipsis only when it's too wide to fit.
    const activitySummary = useMemo(() => {
        const list = messages ?? [];
        for (let i = list.length - 1; i >= 0; i -= 1) {
            const message: any = list[i];
            if (message?.role !== 'assistant') {
                continue;
            }
            const content =
                typeof message.content === 'string'
                    ? message.content.trim()
                    : '';
            if (content) {
                return content.split('\n').pop() ?? content;
            }
            break;
        }
        return '';
    }, [messages]);

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
                        markPending={usePanel}
                        completedToolCallIds={completedToolCallIds}
                    />
                )),
        [messages, usePanel, completedToolCallIds]
    );

    const dim = theme.palette.text.disabled;

    // The green block cursor, blinking, used to mark live streaming output.
    const blinkingCursorSx = {
        'color': TERMINAL_PROMPT,
        'animation': 'cpkBlink 1s steps(2) infinite',
        '@keyframes cpkBlink': { '50%': { opacity: 0 } },
    };

    // Collapsed layout, driven by focus. Engaged (focused) the bar is two lines
    // — the agent activity summary above, the editable prompt below — and holds
    // that shape while a reply streams, so submitting reveals the response above
    // the prompt. Disengaged (blurred) it falls back to one line: the activity
    // summary if there's one to recap, otherwise the prompt. Fresh and idle (no
    // summary yet) the prompt is the only line.
    const hasSummary = isLoading || activitySummary !== '';
    // The collapsed prompt is always mounted; this is whether its row is revealed
    // (expanded) versus collapsed to zero height. Revealed when the bar is
    // focused, or when there's no summary to recap so the prompt is the only line.
    // Animating the row — rather than mounting/unmounting — lets a blur slide the
    // prompt out of view instead of deleting it mid-collapse.
    const promptRevealed = !awaitingApproval && (focused || !hasSummary);
    const collapsedTwoLine = hasSummary && promptRevealed;
    const collapsedHeight = collapsedTwoLine
        ? COLLAPSED_HEIGHT_TWO_LINE
        : COLLAPSED_HEIGHT;

    // Fade the transcript into the background at any edge hiding scrolled-past
    // content. Only when expanded; collapsed is a fixed line or two.
    const fade = `${SCROLL_FADE_HEIGHT}px`;
    const fadeMask = open
        ? `linear-gradient(to bottom, ${
              fadeTop ? 'transparent' : '#000'
          }, #000 ${fade}, #000 calc(100% - ${fade}), ${
              fadeBottom ? 'transparent' : '#000'
          })`
        : undefined;

    // One-line recap of what the agent is doing: the tail of the streamed
    // reply, with the blinking cursor while it streams.
    const summaryLine = (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                py: 0.5,
                // The recap is the agent's own message text, so keep it readable;
                // only the leading marker is muted (dim is reserved for the
                // esc/approval hints).
                color: theme.palette.text.secondary,
                userSelect: 'none',
                minWidth: 0,
            }}
        >
            {/* A blinking cursor marks live streaming output; once the reply
                settles there's nothing to stream, so the marker drops out and
                the recap text stands on its own. */}
            {isLoading ? (
                <Box component="span" sx={blinkingCursorSx}>
                    ▌
                </Box>
            ) : null}
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
                multiline
                maxRows={6}
                sx={{
                    'flex': 1,
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

    // Expanded working indicator and approval hint (collapsed shows the summary
    // line instead of these). A steady "thinking…" with the blinking cursor
    // stands in for the read-only tool calls — those popped in and out of the
    // transcript as each one started and finished; the esc hint trails it.
    const thinkingLine = (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                py: 0.5,
                userSelect: 'none',
                color: theme.palette.text.secondary,
            }}
        >
            <Box component="span" sx={blinkingCursorSx}>
                ▌
            </Box>
            <Box component="span">thinking…</Box>
            <Box component="span" sx={{ color: dim, ml: 1 }}>
                esc to interrupt
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
                    /* Top-right corner overlay: the entity health strip alongside the
                   app chrome (update alert, docs toggle) that used to live in the
                   top bar. Pinned at the collapsed height so it stays put as the
                   terminal expands; the text area is padded to clear it. */
                    <Box
                        ref={statusRef}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 1,
                            display: 'flex',
                            // Expanded, the health items stack vertically in the
                            // corner, so top-align the chrome beside them and let
                            // the box grow past the collapsed bar height.
                            // Collapsed, it's a single row centered in the bar.
                            alignItems: open ? 'flex-start' : 'center',
                            gap: 1.5,
                            height: open ? 'auto' : COLLAPSED_HEIGHT,
                            pt: open ? 1 : 0,
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
                        <SidePanelDocsOpenButton />
                    </Box>
                )}

                <Box
                    ref={scrollRef}
                    onScroll={updateFades}
                    onClick={() => {
                        // A drag to select transcript text also fires a click on
                        // release; focusing the input then would move the caret into
                        // it and clear the selection. Leave focus alone when the user
                        // has just selected something.
                        if (window.getSelection()?.toString()) {
                            return;
                        }
                        // Clicking the collapsed bar reveals the prompt (focused)
                        // beneath the summary; the effect then moves the caret in.
                        // preventScroll: the box's height animation does the reveal —
                        // letting the browser scroll the input into view instead
                        // would yank the summary up before it settles back down.
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
                        pl: 2,
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
                    {/* Content anchoring switches with the panel's motion. While the
                    panel is open, or while a collapse is still animating, the auto
                    top margin bottom-anchors the content: a short transcript sits
                    at the bottom edge and the summary line rides smoothly up with
                    the shrinking panel instead of snapping to the top. Once a
                    collapse settles the margin drops to 0 and the content
                    top-anchors, so focusing or blurring the collapsed bar slides
                    the prompt in or out beneath the pinned summary line. The flip
                    is invisible because at the settled collapsed height the
                    content already fills the row. */}
                    <Box
                        sx={{
                            mt: open || !collapseSettled ? 'auto' : 0,
                            flexShrink: 0,
                        }}
                    >
                        {open || !collapseSettled ? (
                            <>
                                {/* Expanded — and held through the collapse animation:
                                the full transcript, then the live hint or the
                                editable prompt. Keeping it mounted while the panel
                                shrinks lets the prior turns clip away with the
                                closing edge instead of disappearing at once; the
                                swap to the one-line summary waits for the height to
                                settle (collapseSettled). */}
                                {messageNodes}
                                {isLoading
                                    ? thinkingLine
                                    : awaitingApproval
                                      ? approvalHint
                                      : promptLine}
                            </>
                        ) : (
                            <>
                                {/* Collapsed: the activity summary (when there's one
                                to recap) above the prompt. The prompt stays
                                mounted and is shown or hidden by animating its
                                grid row between full and zero height, in step
                                with the bar's own height, so blurring slides it
                                out of view rather than removing it mid-collapse. */}
                                {hasSummary ? summaryLine : null}
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateRows: promptRevealed
                                            ? '1fr'
                                            : '0fr',
                                        transition: resizing
                                            ? 'none'
                                            : 'grid-template-rows 220ms ease',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            minHeight: 0,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {promptLine}
                                    </Box>
                                </Box>
                            </>
                        )}
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
