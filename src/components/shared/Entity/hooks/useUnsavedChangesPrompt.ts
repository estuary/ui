import { useUnmount } from 'react-use';

import { usePrompt } from 'hooks/useBlocker';

export default function useUnsavedChangesPrompt(
    when: boolean,
    callback: Function
) {
    usePrompt('confirm.loseData', when);
    useUnmount(() => callback());
}
