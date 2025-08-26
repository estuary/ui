import type { BaseComponentProps } from 'src/types';

import { useEffect, useState } from 'react';

import { Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import { useEditorStore_draftInitializationError } from 'src/components/editor/Store/hooks';
import FullPageSpinner from 'src/components/fullPage/Spinner';
import useInitializeTaskDraft from 'src/components/shared/Entity/Edit/useInitializeTaskDraft';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

function DraftInitializer({ children }: BaseComponentProps) {
    const { initializeTaskDraft } = useInitializeTaskDraft();

    // Draft Editor Store
    const draftInitializationError = useEditorStore_draftInitializationError();

    // Form State Store
    const formStatus = useFormStateStore_status();

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // This is pretty hacky but we need to check the loading because while we go from capture
        //  to materializing the initTaskDraft can pick up the URL changes. It does make sense to only fire
        //  this when the page is loading though. This does mean that we currently cannot set the form state
        //  back to INIT and get this to run again. Seems like a good trade off for now Q4 2023
        if (loading && formStatus === FormStatus.INIT) {
            void initializeTaskDraft(setLoading);
        }
    }, [initializeTaskDraft, setLoading, formStatus, loading]);

    if (loading) {
        return <FullPageSpinner />;
    } else if (draftInitializationError?.severity === 'error') {
        return (
            <>
                <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                    <FormattedMessage id="workflows.initTask.alert.title.initFailed" />
                </Typography>

                <Typography component="div" align="center">
                    <MessageWithLink
                        messageID={draftInitializationError.messageId}
                    />
                </Typography>
            </>
        );
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default DraftInitializer;
