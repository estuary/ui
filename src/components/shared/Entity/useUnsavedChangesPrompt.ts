import { usePrompt } from 'hooks/useBlocker';
import { useLocation } from 'react-router-dom';

export default function useUnsavedChangesPrompt(when: boolean) {
    const { pathname } = useLocation();

    usePrompt('confirm.loseData', pathname, when);
}
