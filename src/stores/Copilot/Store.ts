import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

// UI store for the in-dashboard assistant. Decouples "Explain" affordances
// scattered through the app from the CopilotKit chat surface mounted in the
// authenticated layout: a trigger calls `openWithPrompt`, a bridge component
// inside the CopilotKit provider consumes `pendingPrompt` and sends it.
interface CopilotAssistantState {
    open: boolean;
    pendingPrompt: string | null;
    setOpen: (open: boolean) => void;
    openWithPrompt: (prompt: string) => void;
    clearPendingPrompt: () => void;
}

export const useCopilotAssistantStore = create<CopilotAssistantState>()(
    devtools(
        (set) => ({
            open: false,
            pendingPrompt: null,

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

            clearPendingPrompt: () => {
                set(
                    produce((state: CopilotAssistantState) => {
                        state.pendingPrompt = null;
                    }),
                    false,
                    'Copilot Assistant Pending Prompt Cleared'
                );
            },
        }),
        devtoolsOptions('copilot-assistant')
    )
);
