import { useEditorStore_id } from 'components/editor/Store/hooks';
import { useRef } from 'react';
import { useUpdateEffect } from 'react-use';
import { CustomEvents } from 'services/types';
import { BaseComponentProps } from 'types';
import useSave from '../Actions/useSave';
import useEntityWorkflowHelpers from '../hooks/useEntityWorkflowHelpers';

function BackgroundDryRun({ children }: BaseComponentProps) {
    const ranOnce = useRef(false);

    const { callFailed } = useEntityWorkflowHelpers();

    const draftId = useEditorStore_id();

    const saveCatalog = useSave(
        CustomEvents.MATERIALIZATION_TEST_BACKGROUND,
        callFailed,
        true,
        true
    );

    useUpdateEffect(() => {
        console.log('background dry run... running', {
            draftId,
            bool: ranOnce.current,
        });
        if (draftId && !ranOnce.current) {
            ranOnce.current = true;
            void saveCatalog(draftId, true);
        }
    }, [draftId, saveCatalog]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default BackgroundDryRun;
