import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityToolbar from 'components/shared/Entity/Header';
import GitPodButton from 'components/transformation/create/GitPodButton';
import InitializeDraftButton from 'components/transformation/create/InitializeDraftButton';
import invariableStores from 'context/Zustand/invariableStores';
import { useMemo } from 'react';
import { CustomEvents } from 'services/logrocket';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
} from 'stores/TransformationCreate/hooks';

import { useStore } from 'zustand';

interface Props {
    entityNameError: string | null;
}

function ConfigHeader({ entityNameError }: Props) {
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

    return (
        <EntityToolbar
            GenerateButton={
                language === 'sql' ? (
                    <InitializeDraftButton
                        entityNameError={entityNameError}
                        selectedCollections={new Set(selectedCollections)}
                    />
                ) : (
                    <GitPodButton
                        entityNameError={entityNameError}
                        sourceCollectionSet={new Set(selectedCollections)}
                    />
                )
            }
            TestButton={<GitPodButton buttonVariant="outlined" />}
            SaveButton={
                <EntitySaveButton
                    taskNames={
                        typeof catalogName === 'string'
                            ? [catalogName]
                            : undefined
                    }
                    logEvent={CustomEvents.COLLECTION_CREATE}
                />
            }
        />
    );
}

export { ConfigHeader };
