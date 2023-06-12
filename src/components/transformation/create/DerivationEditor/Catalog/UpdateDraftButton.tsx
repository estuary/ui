import { LoadingButton } from '@mui/lab';
import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
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
} from 'stores/TransformationCreate/hooks';
import { Transform } from 'types';
import { evaluateTransformConfigs } from 'utils/derivation-utils';
import { hasLength, stripPathing } from 'utils/misc-utils';

interface Props {
    selectedCollections: Set<string>;
    setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

function UpdateDraftButton({ selectedCollections, setDialogOpen }: Props) {
    // Draft Editor Store
    const currentCatalog = useEditorStore_currentCatalog();
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
            const collections = Array.from(selectedCollections);

            const evaluatedTransformConfigs = evaluateTransformConfigs(
                collections,
                transformCount,
                transformConfigs,
                entityName
            );

            const evaluatedTransforms = Object.values(
                evaluatedTransformConfigs
            ).map(
                ({ collection, lambda }): Transform => ({
                    name: stripPathing(collection),
                    source: collection,
                    lambda,
                })
            );

            const draftSpec = { ...currentCatalog.spec };

            draftSpec.derive.transforms = Object.values(evaluatedTransforms);

            const draftSpecResponse = await modifyDraftSpec(draftSpec, {
                draft_id: draftId,
                catalog_name: catalogName,
            });

            if (draftSpecResponse.error) {
                setCatalogUpdating(false);
                // Set error state
            } else {
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
                setDialogOpen(false);
            }
        } else {
            setCatalogUpdating(false);
            // Set error state
        }
    }, [
        setCatalogUpdating,
        setDialogOpen,
        setDraftId,
        setPersistedDraftId,
        setSelectedAttribute,
        setSourceCollections,
        catalogName,
        currentCatalog,
        draftId,
        entityName,
        selectedCollections,
        transformConfigs,
        transformCount,
        updateTransformConfigs,
    ]);

    return (
        <LoadingButton
            variant="contained"
            loading={catalogUpdating}
            disabled={catalogUpdating}
            onClick={updateDerivationSpec}
        >
            <FormattedMessage id="cta.continue" />
        </LoadingButton>
    );
}

export default UpdateDraftButton;
