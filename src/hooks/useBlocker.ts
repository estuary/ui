import type { BlockerFunction } from 'react-router-dom';

import { useCallback, useEffect } from 'react';

import { useBlocker } from 'react-router-dom';

import { useConfirmationModalContext } from 'src/context/Confirmation';

// Based on
//  https://github.com/remix-run/react-router/issues/8139#issuecomment-1021457943
//   and
//  https://github.com/remix-run/react-router/discussions/10898
export function usePrompt(message: string, when = true) {
    const confirmationModalContext = useConfirmationModalContext();

    const shouldBlock = useCallback<BlockerFunction>(
        ({ currentLocation, nextLocation }) => {
            // We only care about the path otherwise we get errors when the search params change
            return when && currentLocation.pathname !== nextLocation.pathname;
        },
        [when]
    );
    const { proceed, state, reset } = useBlocker(shouldBlock);

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
