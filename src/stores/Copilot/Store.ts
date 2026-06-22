import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

// UI store for the in-dashboard assistant. Decouples "Explain" affordances
// scattered through the app from the CopilotKit chat surface mounted in the
// authenticated layout. A bridge component inside the CopilotKit provider
// consumes the pending values and appends the corresponding chat message.
//
// Three trigger styles:
// - openWithPrompt: appends a visible USER message and runs the model in the
//   CURRENT thread (used by "Explain this log" etc.).
// - openWithOpener: clears the thread (provider remount) then appends an
//   ASSISTANT message WITHOUT running the model (used by "New Dataflow", so the
//   panel opens with the agent already asking its first question).
// - openWithPromptInNewThread: clears the thread (provider remount) then appends
//   a visible USER message and runs the model (used by "Get help" on an error,
//   so each help request starts from a clean conversation).
interface CopilotAssistantState {
    open: boolean;
    pendingPrompt: string | null;
    pendingFreshPrompt: string | null;
    pendingOpener: string | null;
    // Bumped by openWithOpener / openWithPromptInNewThread; used as the
    // CopilotKit provider `key` so the panel remounts with a fresh (empty)
    // message thread — the version's reset()/setMessages don't reliably clear
    // the v2 store.
    threadNonce: number;
    // Expanded terminal height in px, shared so the page-content breadcrumb bar
    // (which lives in a separate subtree) can resize the terminal alongside the
    // terminal's own bottom-edge handle. `resizingTerminal` is set by whichever
    // handle is being dragged so the terminal can suppress its height transition
    // and track the cursor without easing.
    expandedHeight: number;
    resizingTerminal: boolean;
    setOpen: (open: boolean) => void;
    setExpandedHeight: (height: number) => void;
    setResizingTerminal: (resizing: boolean) => void;
    openWithPrompt: (prompt: string) => void;
    openWithPromptInNewThread: (prompt: string) => void;
    openWithOpener: (message: string) => void;
    clearPendingPrompt: () => void;
    clearPendingFreshPrompt: () => void;
    clearPendingOpener: () => void;
}

// Default expanded height as a fraction of the viewport; a drag (terminal edge
// or breadcrumb) clamps to [MIN_EXPANDED_HEIGHT, MAX_EXPANDED_RATIO].
const DEFAULT_EXPANDED_RATIO = 0.21;
const MIN_EXPANDED_HEIGHT = 80;
const MAX_EXPANDED_RATIO = 0.85;

const clampExpandedHeight = (height: number): number =>
    Math.min(
        Math.max(height, MIN_EXPANDED_HEIGHT),
        Math.round(window.innerHeight * MAX_EXPANDED_RATIO)
    );

export const useCopilotAssistantStore = create<CopilotAssistantState>()(
    devtools(
        (set) => ({
            open: false,
            pendingPrompt: null,
            pendingFreshPrompt: null,
            pendingOpener: null,
            threadNonce: 0,
            expandedHeight: clampExpandedHeight(
                Math.round(window.innerHeight * DEFAULT_EXPANDED_RATIO)
            ),
            resizingTerminal: false,

            setOpen: (open) => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.open = open;
                    }),
                    false,
                    'Copilot Assistant Open Updated'
                );
            },

            setExpandedHeight: (height) => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.expandedHeight = clampExpandedHeight(height);
                    }),
                    false,
                    'Copilot Assistant Expanded Height Updated'
                );
            },

            setResizingTerminal: (resizing) => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.resizingTerminal = resizing;
                    }),
                    false,
                    'Copilot Assistant Resizing Terminal Updated'
                );
            },

            openWithPrompt: (prompt) => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.open = true;
                        state.pendingPrompt = prompt;
                    }),
                    false,
                    'Copilot Assistant Opened With Prompt'
                );
            },

            openWithPromptInNewThread: (prompt) => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.open = true;
                        state.pendingFreshPrompt = prompt;
                        // Remount the provider (via its `key`) so the help
                        // request starts from an empty thread.
                        state.threadNonce += 1;
                    }),
                    false,
                    'Copilot Assistant Opened With Prompt In New Thread'
                );
            },

            openWithOpener: (message) => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.open = true;
                        state.pendingOpener = message;
                        // Remount the CopilotKit provider (via its `key`) so the
                        // new interview starts from an empty message thread.
                        state.threadNonce += 1;
                    }),
                    false,
                    'Copilot Assistant Opened With Opener'
                );
            },

            clearPendingPrompt: () => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.pendingPrompt = null;
                    }),
                    false,
                    'Copilot Assistant Pending Prompt Cleared'
                );
            },

            clearPendingFreshPrompt: () => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.pendingFreshPrompt = null;
                    }),
                    false,
                    'Copilot Assistant Pending Fresh Prompt Cleared'
                );
            },

            clearPendingOpener: () => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.pendingOpener = null;
                    }),
                    false,
                    'Copilot Assistant Pending Opener Cleared'
                );
            },
        }),
        devtoolsOptions('copilot-assistant')
    )
);
