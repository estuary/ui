import { usePrompt } from 'hooks/useBlocker';
import { useUnmount } from 'react-use';

export default function useUnsavedChangesPrompt(
    when: boolean,
    callback: Function
) {
    usePrompt('You will lose changes', when);
    useUnmount(() => callback());
}
