import { useConfirmationModalContext } from 'context/Confirmation';
import { useCallback, useEffect } from 'react';
import { unstable_useBlocker as useBlocker } from 'react-router-dom';

// Based on
//  https://github.com/remix-run/react-router/issues/8139#issuecomment-1021457943
//   and
//  https://github.com/remix-run/react-router/discussions/10898
export function usePrompt(message: string, when = true) {
    const confirmationModalContext = useConfirmationModalContext();

    // TODO (typing)
    // BlockerFunction is the type but only exported from @remix-router and we should not import from there
    //  so just went with any and made the code safe
    const shouldBlock = useCallback<any>(
        ({ currentLocation, nextLocation }: any) => {
            // We only care about the path otherwise we get errors when the search params change
            return when && currentLocation?.pathname !== nextLocation?.pathname;
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
