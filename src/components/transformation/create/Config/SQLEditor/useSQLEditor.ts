import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import { DraftSpec } from 'hooks/useDraftSpecs';
import { set } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_migrations,
    useTransformationCreate_patchSelectedAttribute,
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';
import { Entity } from 'types';
import { updateMigrations, updateTransforms } from 'utils/derivation-utils';

function useSQLEditor(entityName: string) {
    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const currentCatalog = useEditorStore_currentCatalog();
    const setSpecs = useEditorStore_setSpecs();

    // Transform Create Store
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();
    const attributeType = useTransformationCreate_attributeType();
    const attributeId = useTransformationCreate_selectedAttribute();
    const patchSelectedAttribute =
        useTransformationCreate_patchSelectedAttribute();

    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);

    const defaultSQL = useMemo(() => {
        if (
            attributeType === 'transform' &&
            Object.hasOwn(transformConfigs, attributeId)
        ) {
            return transformConfigs[attributeId].lambda;
        } else if (
            attributeType === 'migration' &&
            Object.hasOwn(migrations, attributeId)
        ) {
            return migrations[attributeId];
        } else {
            return '';
        }
    }, [attributeType, migrations, transformConfigs, attributeId]);

    const processEditorValue = useCallback(
        async (
            value: any,
            catalogName: string,
            specType: Entity,
            propUpdating?: string
        ) => {
            if (!mutateDraftSpecs || !draftSpec) {
                return Promise.reject();
            } else {
                if (propUpdating) {
                    const evaluatedAttribute =
                        attributeType === 'transform'
                            ? updateTransforms(
                                  transformConfigs[attributeId].name,
                                  value,
                                  transformConfigs
                              )
                            : updateMigrations(attributeId, value, migrations);

                    set(draftSpec.spec, propUpdating, evaluatedAttribute);
                } else {
                    draftSpec.spec = value;
                }

                const updateResponse = await modifyDraftSpec(draftSpec.spec, {
                    draft_id: draftId,
                    catalog_name: catalogName,
                    spec_type: specType,
                });

                if (updateResponse.error) {
                    return Promise.reject();
                }

                patchSelectedAttribute(value);

                return mutateDraftSpecs();
            }
        },
        [
            patchSelectedAttribute,
            attributeId,
            attributeType,
            draftId,
            draftSpec,
            migrations,
            mutateDraftSpecs,
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
        defaultValue: defaultSQL,
    };
}

export default useSQLEditor;
