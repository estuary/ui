import useInitializeTaskDraft from 'components/shared/Entity/Edit/useInitializeTaskDraft';
import { useEffect } from 'react';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { BaseComponentProps } from 'types';

function DraftInitializer({ children }: BaseComponentProps) {
    const initializeTaskDraft = useInitializeTaskDraft();

    // Form State Store
    const formStatus = useFormStateStore_status();

    useEffect(() => {
        if (formStatus === FormStatus.INIT) {
            void initializeTaskDraft();
        }
    }, [initializeTaskDraft, formStatus]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default DraftInitializer;
