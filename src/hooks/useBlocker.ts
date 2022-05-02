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
export function useBlocker(blocker: Blocker, when = true) {
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
            refUnBlock.current = navigator.block((tx: Transition) => {
                const autoUnblockingTx = {
                    ...tx,
                    retry() {
                        refUnBlock.current?.(); //need to unblock so retry succeeds
                        tx.retry();
                    },
                };

                blocker(autoUnblockingTx);
            });
        }
    }, [navigator, blocker, when]);
}

/**
 * @source https://github.com/remix-run/react-router/issues/8139#issuecomment-1021457943
 */
export function usePrompt(message: string, when = true, callback?: Function) {
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
                .catch(() => {
                    console.log('hey');
                });
        },
        [message, callback, confirmationModalContext]
    );
    return useBlocker(blocker, when);
}
