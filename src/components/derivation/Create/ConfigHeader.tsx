import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityToolbar from 'components/shared/Entity/Header';
import GitPodButton from 'components/transformation/create/GitPodButton';
import InitializeDraftButton from 'components/transformation/create/InitializeDraftButton';
import invariableStores from 'context/Zustand/invariableStores';
import { useMemo } from 'react';
import { CustomEvents } from 'services/logrocket';
import {
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
} from 'stores/TransformationCreate/hooks';

import { useStore } from 'zustand';

interface Props {
    entityNameError: string | null;
}

function ConfigHeader({ entityNameError }: Props) {
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const language = useTransformationCreate_language();
    const catalogName = useTransformationCreate_catalogName();

    const [selected] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const selectedCollections = useMemo(
        () => Array.from(selected).map((collection) => collection[0]),
        [selected]
    );

    const helpers = {
        callFailed: (formState: any) => {
            setFormState({
                status: FormStatus.FAILED,
                exitWhenLogsClose: false,
                ...formState,
            });
        },
        exit: () => {
            resetFormState();
        },
    };

    const handlers = {
        closeLogs: () => {
            setFormState({
                showLogs: false,
            });

            if (exitWhenLogsClose) {
                helpers.exit();
            }
        },
    };

    return (
        <EntityToolbar
            GenerateButton={
                language === 'sql' ? (
                    <InitializeDraftButton
                        entityNameError={entityNameError}
                        selectedCollections={selectedCollections}
                    />
                ) : (
                    <GitPodButton
                        entityNameError={entityNameError}
                        selectedCollections={selectedCollections}
                    />
                )
            }
            TestButton={<GitPodButton buttonVariant="outlined" />}
            SaveButton={
                <EntitySaveButton
                    callFailed={helpers.callFailed}
                    taskNames={
                        typeof catalogName === 'string'
                            ? [catalogName]
                            : undefined
                    }
                    closeLogs={handlers.closeLogs}
                    logEvent={CustomEvents.COLLECTION_CREATE}
                />
            }
        />
    );
}

export { ConfigHeader };
