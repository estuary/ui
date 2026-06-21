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
    setOpen: (open: boolean) => void;
    openWithPrompt: (prompt: string) => void;
    openWithPromptInNewThread: (prompt: string) => void;
    openWithOpener: (message: string) => void;
    clearPendingPrompt: () => void;
    clearPendingFreshPrompt: () => void;
    clearPendingOpener: () => void;
}

export const useCopilotAssistantStore = create<CopilotAssistantState>()(
    devtools(
        (set) => ({
            open: false,
            pendingPrompt: null,
            pendingFreshPrompt: null,
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
