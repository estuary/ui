import FullPageSpinner from 'components/fullPage/Spinner';
import useInitializeTaskDraft from 'components/shared/Entity/Edit/useInitializeTaskDraft';
import { useEffect, useState } from 'react';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { BaseComponentProps } from 'types';

function DraftInitializer({ children }: BaseComponentProps) {
    const initializeTaskDraft = useInitializeTaskDraft();

    // Form State Store
    const formStatus = useFormStateStore_status();

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (formStatus === FormStatus.INIT) {
            void initializeTaskDraft(setLoading);
        }
    }, [initializeTaskDraft, setLoading, formStatus]);

    if (loading) {
        return <FullPageSpinner />;
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default DraftInitializer;
