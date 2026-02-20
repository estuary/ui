import { usePrompt } from 'src/hooks/useBlocker';

export default function useUnsavedChangesPrompt(
    when: boolean,
    callback: Function
) {
    usePrompt('confirm.loseData', when);
    // useUnmount(() => callback());
}
