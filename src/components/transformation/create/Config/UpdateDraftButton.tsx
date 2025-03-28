import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_catalogUpdating,
    useTransformationCreate_name,
    useTransformationCreate_setCatalogUpdating,
    useTransformationCreate_setSelectedAttribute,
    useTransformationCreate_setSourceCollections,
    useTransformationCreate_transformConfigs,
    useTransformationCreate_transformCount,
    useTransformationCreate_updateTransformConfigs,
} from 'src/stores/TransformationCreate/hooks';
import { Transform } from 'src/types';
import { evaluateTransformConfigs } from 'src/utils/derivation-utils';
import { hasLength } from 'src/utils/misc-utils';

function UpdateDraftButton({ toggle }: AddCollectionDialogCTAProps) {
    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(
        SelectTableStoreNames.ENTITY_SELECTOR,
        selectableTableStoreSelectors.selected.get
    );

    // Draft Editor Store
    const currentCatalog = useEditorStore_currentCatalog();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const draftId = useEditorStore_persistedDraftId();
    const setDraftId = useEditorStore_setId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    // Transformation Create Store
    const entityName = useTransformationCreate_name();
    const catalogName = useTransformationCreate_catalogName();
    const setSelectedAttribute = useTransformationCreate_setSelectedAttribute();

    const catalogUpdating = useTransformationCreate_catalogUpdating();
    const setCatalogUpdating = useTransformationCreate_setCatalogUpdating();

    const transformCount = useTransformationCreate_transformCount();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const updateTransformConfigs =
        useTransformationCreate_updateTransformConfigs();
    const setSourceCollections = useTransformationCreate_setSourceCollections();

    const updateDerivationSpec = useCallback(async (): Promise<void> => {
        setCatalogUpdating(true);

        if (draftId && catalogName && currentCatalog) {
            const newCollections = Array.from(selected).map(
                (collection) => collection[1].catalog_name
            );

            const evaluatedTransformConfigs = evaluateTransformConfigs(
                newCollections,
                transformCount,
                transformConfigs,
                entityName
            );

            const evaluatedTransforms = Object.values(
                evaluatedTransformConfigs
            ).map(
                ({ collection, lambda, shuffle, name }): Transform => ({
                    name,
                    source: collection,
                    lambda,
                    shuffle,
                })
            );

            const draftSpec = { ...currentCatalog.spec };

            draftSpec.derive.transforms = evaluatedTransforms;

            const draftSpecResponse = await modifyDraftSpec(draftSpec, {
                draft_id: draftId,
                catalog_name: catalogName,
            });

            if (draftSpecResponse.error || !mutateDraftSpecs) {
                setCatalogUpdating(false);
                // Set error state
            } else {
                await mutateDraftSpecs();

                const collections = evaluatedTransforms.map(
                    ({ source }) => source
                );

                setSourceCollections(collections);

                updateTransformConfigs(evaluatedTransformConfigs);

                const transformIds = Object.keys(evaluatedTransformConfigs);

                const evaluatedAttribute = hasLength(transformIds)
                    ? transformIds[0]
                    : '';

                setSelectedAttribute(evaluatedAttribute);

                setDraftId(draftId);
                setPersistedDraftId(draftId);

                setCatalogUpdating(false);
                toggle(false);
            }
        } else {
            setCatalogUpdating(false);
            // Set error state
        }
    }, [
        catalogName,
        currentCatalog,
        draftId,
        entityName,
        mutateDraftSpecs,
        selected,
        setCatalogUpdating,
        toggle,
        setDraftId,
        setPersistedDraftId,
        setSelectedAttribute,
        setSourceCollections,
        transformConfigs,
        transformCount,
        updateTransformConfigs,
    ]);

    return (
        <SafeLoadingButton
            variant="contained"
            loading={catalogUpdating}
            disabled={selected.size < 1 || catalogUpdating}
            onClick={updateDerivationSpec}
        >
            <FormattedMessage id="cta.continue" />
        </SafeLoadingButton>
    );
}

export default UpdateDraftButton;
