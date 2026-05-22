import { keyframes } from '@mui/material';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LocalStorageKeys } from 'src/utils/localStorage-utils';

interface AgentSkillsState {
    toastDismissed: boolean;
    dismissToast: () => void;
}

export const useAgentSkillsStore = create<AgentSkillsState>()(
    persist(
        (set) => ({
            toastDismissed: false,
            dismissToast: () => set({ toastDismissed: true }),
        }),
        { name: LocalStorageKeys.AGENT_SKILLS_TOAST_DISMISSED }
    )
);

export const AGENT_SKILLS_URL = 'https://docs.estuary.dev/guides/agent-skills/';

export const GRADIENT = {
    light: 'linear-gradient(135deg, #2e64eb 0%, #4f8ef7 45%, #36c5b0 100%)',
    dark: 'linear-gradient(135deg, #1a4bcb 0%, #3a6fd4 45%, #2a9e8c 100%)',
};

export const BG_GRADIENT = {
    light: 'linear-gradient(135deg, rgba(46,100,235,0.08) 0%, rgba(54,197,176,0.10) 100%)',
    dark: 'linear-gradient(180deg, rgba(46,100,235,0.12) 0%, rgba(54,197,176,0.16) 100%)',
};

export const SECONDARY_TEXT_COLOR = {
    light: '#475569',
    dark: '#94a3b8',
};

export const LINK_COLOR = '#2e64eb';

const GRADIENT_HORIZONTAL = {
    light: 'linear-gradient(90deg, #2e64eb, #4f8ef7, #36c5b0, #5fe3c9, #2e64eb)',
    dark: 'linear-gradient(90deg, #1a4bcb, #3a6fd4, #2a9e8c, #4cc4aa, #1a4bcb)',
};
const shimmer = keyframes`
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;
export const SHIMMER_STYLES = (mode: 'light' | 'dark') => ({
    background: GRADIENT_HORIZONTAL[mode],
    backgroundSize: '200% 100%',
    animation: `${shimmer} 30s linear infinite`,
});
