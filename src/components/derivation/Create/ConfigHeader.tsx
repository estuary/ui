import type { ConfigHeaderProps } from 'src/components/derivation/Create/types';

import { useMemo } from 'react';

import { useStore } from 'zustand';

import EntityToolbar from 'src/components/shared/Entity/Header';
import DraftIdGeneratorButton from 'src/components/transformation/create/DraftIdGeneratorButton';
import InitializeDraftButton from 'src/components/transformation/create/InitializeDraftButton';
import invariableStores from 'src/context/Zustand/invariableStores';
import { CustomEvents } from 'src/services/types';
import { useTransformationCreate_language } from 'src/stores/TransformationCreate/hooks';

function ConfigHeader({ entityNameError }: ConfigHeaderProps) {
    const language = useTransformationCreate_language();

    const [selected] = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const selectedCollections = useMemo(
        () =>
            Array.from(selected).map(
                (collection) => collection[1].catalog_name
            ),
        [selected]
    );

    return (
        <EntityToolbar
            hideLogs
            GenerateButton={
                language === 'sql' ? (
                    <InitializeDraftButton
                        entityNameError={entityNameError}
                        selectedCollections={new Set(selectedCollections)}
                    />
                ) : (
                    <InitializeDraftButton
                        entityNameError={entityNameError}
                        selectedCollections={new Set(selectedCollections)}
                    />
                )
            }
            primaryButtonProps={{
                logEvent: CustomEvents.COLLECTION_CREATE,
            }}
            SecondaryButtonComponent={DraftIdGeneratorButton}
            secondaryButtonProps={{
                buttonVariant: 'outlined',
            }}
        />
    );
}

export { ConfigHeader };
