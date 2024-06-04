import EntityToolbar from 'components/shared/Entity/Header';
import GitPodButton from 'components/transformation/create/GitPodButton';
import InitializeDraftButton from 'components/transformation/create/InitializeDraftButton';
import invariableStores from 'context/Zustand/invariableStores';
import { useMemo } from 'react';
import { CustomEvents } from 'services/types';
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
            hideLogs
            taskNames={
                typeof catalogName === 'string' ? [catalogName] : undefined
            }
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
            primaryButtonProps={{
                logEvent: CustomEvents.COLLECTION_CREATE,
            }}
            SecondaryButtonComponent={GitPodButton}
            secondaryButtonProps={{
                buttonVariant: 'outlined',
            }}
        />
    );
}

export { ConfigHeader };
