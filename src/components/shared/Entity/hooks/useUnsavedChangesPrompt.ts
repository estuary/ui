import { usePrompt } from 'hooks/useBlocker';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

export default function useUnsavedChangesPrompt(
    when: boolean,
    callback: Function
) {
    const intl = useIntl();
    usePrompt(intl.formatMessage({ id: 'confirm.loseData' }), when);
    useUnmount(() => callback());
}
