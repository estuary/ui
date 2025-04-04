import type { Transform } from 'src/types';

import { useCallback } from 'react';

import { Button } from '@mui/material';

import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_emptySQLExists,
    useTransformationCreate_migrations,
    useTransformationCreate_setCatalogUpdating,
    useTransformationCreate_setSelectedAttribute,
    useTransformationCreate_transformConfigs,
} from 'src/stores/TransformationCreate/hooks';

function PatchDraftButton() {
    // Draft Editor Store
    const currentCatalog = useEditorStore_currentCatalog();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const draftId = useEditorStore_persistedDraftId();
    const setDraftId = useEditorStore_setId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();

    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();
    const setSelectedAttribute = useTransformationCreate_setSelectedAttribute();

    const setCatalogUpdating = useTransformationCreate_setCatalogUpdating();

    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();
    const emptySQLExists = useTransformationCreate_emptySQLExists();

    const updateDerivationSpec = useCallback(async (): Promise<void> => {
        setCatalogUpdating(true);
        setFormState({
            status: FormStatus.GENERATING,
            error: null,
            message: { key: null, severity: null },
        });

        if (draftId && catalogName && currentCatalog) {
            const evaluatedTransforms = Object.values(transformConfigs).map(
                ({ collection, lambda, shuffle, name }): Transform => ({
                    name,
                    source: collection,
                    lambda,
                    shuffle,
                })
            );

            const draftSpec = { ...currentCatalog.spec };

            draftSpec.derive.transforms = evaluatedTransforms;

            const evaluatedMigrations = Object.values(migrations).filter(
                (migration) => migration !== ''
            );

            draftSpec.derive.using.sqlite =
                evaluatedMigrations.length > 0
                    ? { migrations: evaluatedMigrations }
                    : {};

            const draftSpecResponse = await modifyDraftSpec(draftSpec, {
                draft_id: draftId,
                catalog_name: catalogName,
            });

            if (draftSpecResponse.error) {
                setCatalogUpdating(false);
                setFormState({
                    status: FormStatus.FAILED,
                    error: {
                        title: 'newTransform.errors.draftSpecUpdateFailed',
                        error: draftSpecResponse.error,
                    },
                });
            } else if (!mutateDraftSpecs) {
                setCatalogUpdating(false);
                setFormState({ status: FormStatus.FAILED });
            } else {
                await mutateDraftSpecs();

                let evaluatedAttribute = '';

                if (!isEmpty(transformConfigs)) {
                    evaluatedAttribute = Object.keys(transformConfigs)[0];
                } else if (!isEmpty(migrations)) {
                    evaluatedAttribute = Object.keys(migrations)[0];
                }

                setSelectedAttribute(evaluatedAttribute);

                setDraftId(draftId);
                setPersistedDraftId(draftId);

                setCatalogUpdating(false);
                setFormState({ status: FormStatus.GENERATED });
            }
        } else {
            setCatalogUpdating(false);
            setFormState({ status: FormStatus.FAILED });
            // Set error state
        }
    }, [
        setCatalogUpdating,
        setDraftId,
        setFormState,
        setPersistedDraftId,
        setSelectedAttribute,
        catalogName,
        currentCatalog,
        draftId,
        migrations,
        mutateDraftSpecs,
        transformConfigs,
    ]);

    return (
        <Button disabled={emptySQLExists} onClick={updateDerivationSpec}>
            <FormattedMessage id="cta.next" />
        </Button>
    );
}

export default PatchDraftButton;
