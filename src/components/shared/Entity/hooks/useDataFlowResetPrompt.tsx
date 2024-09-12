import { useConfirmationModalContext } from 'context/Confirmation';
import { useCallback } from 'react';
import BindingReview from '../DataflowReset/BindingReview';

function useDataFlowResetPrompt() {
    const confirmationModalContext = useConfirmationModalContext();

    return useCallback(
        (callback: (data: any) => void) => {
            confirmationModalContext
                ?.showConfirmation(
                    {
                        message: (
                            <BindingReview
                            // selected={collectionsBeingBackfilled}
                            />
                        ),
                        title: 'workflows.save.review.header',
                    },
                    false
                )
                .then((accepted) => {
                    callback(accepted);
                })
                .catch((err) => {
                    console.log('catch', err);
                });
        },
        [confirmationModalContext]
    );
}

export default useDataFlowResetPrompt;
