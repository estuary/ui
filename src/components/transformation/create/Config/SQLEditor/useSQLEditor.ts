import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import { SuccessResponse } from 'hooks/supabase-swr';
import { DraftSpec, DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useCallback, useEffect, useState } from 'react';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_migrations,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';
import { KeyedMutator } from 'swr';
import { updateMigrations, updateTransforms } from 'utils/derivation-utils';

function useSQLEditor(
    entityName: string,
    draftSpecs: DraftSpecQuery[],
    mutate: KeyedMutator<SuccessResponse<DraftSpecQuery>>
) {
    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();

    const currentCatalog = useEditorStore_currentCatalog();
    const setSpecs = useEditorStore_setSpecs();

    // Transform Create Store
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();
    const attributeType = useTransformationCreate_attributeType();

    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);

    const processEditorValue = useCallback(
        async (value: any, attributeId: string) => {
            if (draftSpec) {
                if (attributeType === 'transform') {
                    draftSpec.spec.derive.transforms = updateTransforms(
                        transformConfigs[attributeId].name,
                        value,
                        transformConfigs
                    );
                } else {
                    draftSpec.spec.derive.using.sqlite.migrations =
                        updateMigrations(attributeId, value, migrations);
                }

                const updateResponse = await modifyDraftSpec(draftSpec.spec, {
                    draft_id: draftId,
                    catalog_name: entityName,
                });

                if (updateResponse.error) {
                    return Promise.reject();
                }

                return mutate();
            } else {
                return Promise.reject();
            }
        },
        [
            attributeType,
            draftId,
            draftSpec,
            entityName,
            migrations,
            mutate,
            transformConfigs,
        ]
    );

    useEffect(() => {
        if (draftSpecs.length > 0) {
            setSpecs(draftSpecs);

            if (currentCatalog) {
                draftSpecs.some((val) => {
                    if (val.catalog_name !== entityName) {
                        return false;
                    }

                    setDraftSpec(val);
                    return true;
                });
            }
        }
        // We do not care if currentCatalog changes that is handled below
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftSpecs, entityName, setSpecs]);

    useEffect(() => {
        if (currentCatalog) {
            setDraftSpec(currentCatalog);
        }
    }, [currentCatalog]);

    return {
        onChange: processEditorValue,
        draftSpec,
    };
}

export default useSQLEditor;
