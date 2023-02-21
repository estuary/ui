import { usePrompt } from 'hooks/useBlocker';
import { useLocation } from 'react-router-dom';
import { useUnmount } from 'react-use';

export default function useUnsavedChangesPrompt(
    when: boolean,
    callback: Function
) {
    const { pathname } = useLocation();

    usePrompt('confirm.loseData', pathname, when);
    useUnmount(() => callback());
}
