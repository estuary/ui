import { useConfirmationModalContext } from 'context/Confirmation';
import { useCallback } from 'react';
import { useBindingStore } from 'stores/Binding/Store';
import { useShallow } from 'zustand/react/shallow';
import BindingReview from '../DataflowResetModal/BindingReview';

function useDataFlowResetPrompt() {
    const confirmationModalContext = useConfirmationModalContext();

    const collectionsBeingBackfilled = useBindingStore(
        useShallow((state) => {
            return state.backfilledBindings.map((backfilledBinding) => {
                return state.resourceConfigs[backfilledBinding].meta
                    .collectionName;
            });
        })
    );

    const backfillDataFlowTarget = useBindingStore(
        (state) => state.backfillDataFlowTarget
    );

    return useCallback(
        (callback: (data: any) => void) => {
            confirmationModalContext
                ?.showConfirmation(
                    {
                        message: (
                            <BindingReview
                                selected={collectionsBeingBackfilled}
                            />
                        ),
                        title: 'workflows.save.review.header',
                    },
                    false
                )
                .then((data) => {
                    callback(data ? backfillDataFlowTarget : null);
                })
                .catch((err) => {
                    console.log('catch', err);
                });
        },
        [
            backfillDataFlowTarget,
            collectionsBeingBackfilled,
            confirmationModalContext,
        ]
    );
}

export default useDataFlowResetPrompt;
