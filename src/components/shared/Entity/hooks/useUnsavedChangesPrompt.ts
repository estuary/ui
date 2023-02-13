import { unstable_usePrompt } from 'react-router-dom';
import { useUnmount } from 'react-use';

export default function useUnsavedChangesPrompt(
    when: boolean,
    callback: Function
) {
    unstable_usePrompt({ when, message: 'You will lose changes' });
    useUnmount(() => callback());
}
