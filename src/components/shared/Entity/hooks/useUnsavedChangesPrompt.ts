import { usePrompt } from 'hooks/useBlocker';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

export default function useUnsavedChangesPrompt(
    when: boolean,
    callback: Function
) {
    const intl = useIntl();
    const message = intl.formatMessage({ id: 'confirm.loseData' });

    usePrompt(message, when);
    useUnmount(() => callback());
}
