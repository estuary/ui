import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

// UI store for the in-dashboard assistant. Decouples "Explain" affordances
// scattered through the app from the CopilotKit chat surface mounted in the
// authenticated layout. A bridge component inside the CopilotKit provider
// consumes the pending values and appends the corresponding chat message.
//
// Two trigger styles:
// - openWithPrompt: appends a visible USER message and runs the model (used by
//   "Explain this log" etc., where the user is effectively asking a question).
// - openWithOpener: appends an ASSISTANT message WITHOUT running the model (used
//   by "New Dataflow", so the panel opens with the agent already asking its
//   first question — no synthetic user prompt shown, no latency).
interface CopilotAssistantState {
    open: boolean;
    pendingPrompt: string | null;
    pendingOpener: string | null;
    // Bumped by openWithOpener; used as the CopilotKit provider `key` so a new
    // interview remounts the provider with a fresh (empty) message thread —
    // the version's reset()/setMessages don't reliably clear the v2 store.
    threadNonce: number;
    setOpen: (open: boolean) => void;
    openWithPrompt: (prompt: string) => void;
    openWithOpener: (message: string) => void;
    clearPendingPrompt: () => void;
    clearPendingOpener: () => void;
}

export const useCopilotAssistantStore = create<CopilotAssistantState>()(
    devtools(
        (set) => ({
            open: false,
            pendingPrompt: null,
            pendingOpener: null,
            threadNonce: 0,

            setOpen: (open) => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.open = open;
                    }),
                    false,
                    'Copilot Assistant Open Updated'
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
