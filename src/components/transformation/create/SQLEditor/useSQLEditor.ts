import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import useDraftSpecs, { DraftSpec } from 'hooks/useDraftSpecs';
import { useEffect, useState } from 'react';
import { useTransformationCreate_transformConfigs } from 'stores/TransformationCreate/hooks';
import { updateTransforms } from 'utils/derivation-utils';

const entityType = 'collection';

// TODO (sql editor): Add support for migration updates.
function useSQLEditor(entityName: string) {
    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();

    const currentCatalog = useEditorStore_currentCatalog();
    const setSpecs = useEditorStore_setSpecs();

    // Transform Create Store
    const transformConfigs = useTransformationCreate_transformConfigs();

    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);

    const { draftSpecs, isValidating, mutate } = useDraftSpecs(draftId, {
        specType: entityType,
        catalogName: entityName,
    });

    const processEditorValue = async (
        value: any,
        subject: 'transform' | 'migration',
        transformSource?: string
    ) => {
        if (draftSpec) {
            if (subject === 'transform' && transformSource) {
                draftSpec.spec.derive.transforms = updateTransforms(
                    transformSource,
                    value,
                    transformConfigs
                );
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
    };

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
        isValidating,
        mutate,
    };
}

export default useSQLEditor;
