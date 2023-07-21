import { BaseComponentProps } from 'types';

import { useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import { Typography } from '@mui/material';

import MessageWithLink from 'components/content/MessageWithLink';
import { useEditorStore_draftInitializationError } from 'components/editor/Store/hooks';
import FullPageSpinner from 'components/fullPage/Spinner';
import useInitializeTaskDraft from 'components/shared/Entity/Edit/useInitializeTaskDraft';

import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

function DraftInitializer({ children }: BaseComponentProps) {
    const initializeTaskDraft = useInitializeTaskDraft();

    // Draft Editor Store
    const draftInitializationError = useEditorStore_draftInitializationError();

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
