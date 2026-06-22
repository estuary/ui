import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

// UI store for the in-dashboard assistant. Decouples "Explain" affordances
// scattered through the app from the CopilotKit chat surface mounted in the
// authenticated layout. A bridge component inside the CopilotKit provider
// consumes the pending values and appends the corresponding chat message.
//
// Two trigger styles:
// - openWithPrompt: appends a visible USER message and runs the model in the
//   CURRENT thread (used by "Explain this log" etc.).
// - openWithPromptInNewThread: clears the thread (provider remount) then appends
//   a visible USER message and runs the model (used by "Get help" on an error,
//   so each help request starts from a clean conversation).
interface CopilotAssistantState {
    open: boolean;
    pendingPrompt: string | null;
    pendingFreshPrompt: string | null;
    // Bumped by openWithPromptInNewThread; used as the CopilotKit provider `key`
    // so the panel remounts with a fresh (empty) message thread — the version's
    // reset()/setMessages don't reliably clear the v2 store.
    threadNonce: number;
    // Expanded terminal height in px, shared so the page-content breadcrumb bar
    // (which lives in a separate subtree) can resize the terminal alongside the
    // terminal's own bottom-edge handle. `resizingTerminal` is set by whichever
    // handle is being dragged so the terminal can suppress its height transition
    // and track the cursor without easing.
    expandedHeight: number;
    resizingTerminal: boolean;
    // Whether the in-dashboard assistant is enabled. Persisted (per browser) and
    // toggled from Admin → Settings; when false, the layout doesn't mount it.
    assistantEnabled: boolean;
    setOpen: (open: boolean) => void;
    setExpandedHeight: (height: number) => void;
    setResizingTerminal: (resizing: boolean) => void;
    setAssistantEnabled: (enabled: boolean) => void;
    openWithPrompt: (prompt: string) => void;
    openWithPromptInNewThread: (prompt: string) => void;
    clearPendingPrompt: () => void;
    clearPendingFreshPrompt: () => void;
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
    persist(
        devtools(
            (set) => ({
                open: false,
                pendingPrompt: null,
                pendingFreshPrompt: null,
                threadNonce: 0,
                expandedHeight: clampExpandedHeight(
                    Math.round(window.innerHeight * DEFAULT_EXPANDED_RATIO)
                ),
                resizingTerminal: false,
                assistantEnabled: true,

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

                setAssistantEnabled: (enabled) => {
                    set(
                        produce((state: CopilotAssistantState) => {
                            state.assistantEnabled = enabled;
                            // Collapse on disable so re-enabling brings the
                            // terminal back as the collapsed bar, not expanded.
                            if (!enabled) {
                                state.open = false;
                            }
                        }),
                        false,
                        'Copilot Assistant Enabled Updated'
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
            }),
            devtoolsOptions('copilot-assistant')
        ),
        {
            // Only the enable flag is durable; the rest is ephemeral UI state.
            name: 'estuary.copilot-assistant-settings',
            version: 0,
            partialize: (state) => ({
                assistantEnabled: state.assistantEnabled,
            }),
        }
    )
);
