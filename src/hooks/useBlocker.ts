import { useConfirmationModalContext } from 'context/Confirmation';
import { useEffect } from 'react';
import { unstable_useBlocker as useBlocker } from 'react-router-dom';

/**
 * Based on https://github.com/remix-run/react-router/issues/8139#issuecomment-1021457943
 */
export function usePrompt(message: string, when = true) {
    const confirmationModalContext = useConfirmationModalContext();
    const { proceed, state, reset } = useBlocker(when);

    useEffect(() => {
        if (state === 'blocked') {
            confirmationModalContext
                ?.showConfirmation({
                    message,
                })
                .then(async (confirmed: any) => {
                    if (confirmed) {
                        proceed();
                    } else {
                        reset();
                    }
                })
                .catch(() => {
                    reset();
                });
        }

        // We only really care to run this when the state value changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);
}
