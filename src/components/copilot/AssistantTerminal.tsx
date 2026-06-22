import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, InputBase, useMediaQuery, useTheme } from '@mui/material';

import {
    useCopilotAdditionalInstructions,
    useCopilotChatHeadless_c,
} from '@copilotkit/react-core';

import { AssistantMarkdown } from 'src/components/copilot/AssistantMarkdown';
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

const toolCallName = (call: any): string =>
    call?.function?.name ?? call?.name ?? 'tool call';

// Renders a single chat message terminal-style: user turns as a `❯` prompt line,
// assistant turns as plain output. Read-only tool calls are not shown — the
// steady "thinking…" indicator stands in for them; only approval-required tool
// calls surface, via their interactive card.
function MessageLine({ message }: { message: any }) {
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
            {content ? <AssistantMarkdown>{content}</AssistantMarkdown> : null}
            {generativeUI ? (
                <Box sx={{ mt: content ? 1 : 0 }}>{generativeUI}</Box>
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
    // Whether a collapse has finished animating. While the panel is resizing
    // between sizes the content stays bottom-anchored (rides smoothly with the
    // moving edge); once settled and collapsed it flips to top-anchored so the
    // focus/submit reveals slide the prompt in beneath the summary. See `mt` on
    // the content box.
    const [collapseSettled, setCollapseSettled] = useState(true);
    // Whether the collapsed prompt row has finished revealing/collapsing. The
    // "type a command…" placeholder is held back until this settles, so it
    // doesn't flash while the row slides in or out.
    const [promptSettled, setPromptSettled] = useState(true);
    // Whether the transcript has content scrolled past the top/bottom edge —
    // each edge fades only while it hides something, so the pinned newest line
    // (and the prompt below it) stay crisp.
    const [fadeTop, setFadeTop] = useState(false);
    const [fadeBottom, setFadeBottom] = useState(false);
    const outerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
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
                    <MessageLine key={message.id} message={message} />
                )),
        [messages]
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

    // Hold the placeholder back until the prompt row settles after a reveal,
    // collapse, or panel resize — otherwise "type a command…" flashes while the
    // row is still sliding. Keyed on the row's reveal state and the panel's
    // open/collapsed state, the two things that animate the row's size.
    useEffect(() => {
        setPromptSettled(false);
        const id = window.setTimeout(() => setPromptSettled(true), 240);
        return () => window.clearTimeout(id);
    }, [promptRevealed, open]);

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

    // One-line recap of what the agent is doing: an in-flight tool call or the
    // tail of the streamed reply, with the blinking cursor while it streams.
    const summaryLine = (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                py: 0.5,
                // The recap is the agent's own message text, so keep it readable;
                // only the leading marker is muted (dim is reserved for the
                // prompt placeholder and the esc/approval hints).
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
                placeholder={promptSettled ? 'type a command…' : ''}
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
                    '& textarea::placeholder': {
                        color: dim,
                        opacity: 1,
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
                onScroll={updateFades}
                onClick={() => {
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
                    pr: showStatus ? `${STATUS_AREA_WIDTH}px` : 2,
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
                                    transition: dragging
                                        ? 'none'
                                        : 'grid-template-rows 220ms ease',
                                }}
                            >
                                <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
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
