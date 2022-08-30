import { useConfirmationModalContext } from 'context/Confirmation';
import type { Blocker, History, Transition } from 'history';
import { ContextType, useCallback, useContext, useEffect, useRef } from 'react';
import {
    Navigator as BaseNavigator,
    UNSAFE_NavigationContext as NavigationContext,
} from 'react-router-dom';

// Taken from https://github.com/remix-run/react-router/issues/8139#issuecomment-1023105785

interface Navigator extends BaseNavigator {
    block: History['block'];
}

type NavigationContextWithBlock = ContextType<typeof NavigationContext> & {
    navigator: Navigator;
};

/**
 * @source https://github.com/remix-run/react-router/commit/256cad70d3fd4500b1abcfea66f3ee622fb90874
 */
export function useBlocker(blocker: Blocker, when = true, path?: string) {
    const { navigator } = useContext(
        NavigationContext
    ) as NavigationContextWithBlock;

    const refUnBlock = useRef<() => void>();

    useEffect(() => {
        if (!when) {
            refUnBlock.current?.();
            return;
        }

        if (!refUnBlock.current) {
            const blockHandler = (tx: Transition) => {
                const autoUnblockingTx = {
                    ...tx,
                    retry() {
                        refUnBlock.current?.(); //need to unblock so retry succeeds
                        tx.retry();
                    },
                };

                // If the path is set then we only want to prompt the user is the actual
                //      path is changing. Otherwise, we just let them navigate. These must
                //      be an EXACT match.
                if (path && path === tx.location.pathname) {
                    // If the path is not changing then the search params are being used
                    //      so we want to allow that. So we use the try as if the user allower
                    //      the nav. Then we set the current again to make sure it blocks future
                    //      navigation that might change the path
                    autoUnblockingTx.retry();
                    refUnBlock.current = navigator.block(blockHandler);
                } else {
                    blocker(autoUnblockingTx);
                }
            };
            refUnBlock.current = navigator.block(blockHandler);
        }
    }, [navigator, blocker, when, path]);
}

/**
 * @source https://github.com/remix-run/react-router/issues/8139#issuecomment-1021457943
 */
export function usePrompt(
    message: string,
    path: string,
    when = true,
    callback?: Function
) {
    const confirmationModalContext = useConfirmationModalContext();
    const blocker = useCallback(
        async (tx: Transition) => {
            await confirmationModalContext
                ?.showConfirmation({
                    message,
                })
                .then((confirmed) => {
                    if (confirmed) {
                        if (callback) callback();
                        tx.retry();
                    }
                })
                .catch(() => {});
        },
        [message, callback, confirmationModalContext]
    );
    return useBlocker(blocker, when, path);
}
