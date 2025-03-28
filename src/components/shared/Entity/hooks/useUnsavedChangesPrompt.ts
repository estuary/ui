import { usePrompt } from 'src/hooks/useBlocker';
import { useUnmount } from 'react-use';

export default function useUnsavedChangesPrompt(
    when: boolean,
    callback: Function
) {
    usePrompt('confirm.loseData', when);
    useUnmount(() => callback());
}
