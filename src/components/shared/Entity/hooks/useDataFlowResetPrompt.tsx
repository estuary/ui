import { useConfirmationModalContext } from 'context/Confirmation';
import { useCallback } from 'react';
import { useBindingStore } from 'stores/Binding/Store';
import { useShallow } from 'zustand/react/shallow';
import BindingReview from '../InterstitialSave/DataflowResetModal/BindingReview';

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

    return useCallback(
        (callback: (data: any) => void) => {
            // Need to make sure they select a materialization first
            confirmationModalContext?.setContinueAllowed(false);

            confirmationModalContext
                ?.showConfirmation({
                    message: (
                        <BindingReview
                            selected={collectionsBeingBackfilled}
                            setContinuedAllowed={
                                confirmationModalContext.setContinueAllowed
                            }
                        />
                    ),
                    title: 'workflows.save.review.header',
                })
                .then((data) => {
                    console.log('then', data);
                    callback(data);
                })
                .catch((err) => {
                    console.log('catch', err);
                });
        },
        [collectionsBeingBackfilled, confirmationModalContext]
    );
}

export default useDataFlowResetPrompt;
