import { useCallback, useMemo } from 'react';

import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import { createEntityDraft } from 'src/api/drafts';
import { createDraftSpec } from 'src/api/draftSpecs';
import { authenticatedRoutes } from 'src/app/routes';
import {
    useEditorStore_setCatalogName,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import {
    useTransformationCreate_addTransformConfigs,
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
    useTransformationCreate_name,
    useTransformationCreate_setSelectedAttribute,
    useTransformationCreate_setSourceCollections,
} from 'src/stores/TransformationCreate/hooks';
import type { TransformConfig } from 'src/stores/TransformationCreate/types';
import {
    generateInitialSpec,
    templateTransformConfig,
} from 'src/utils/derivation-utils';
import { stripPathing } from 'src/utils/misc-utils';

interface Props {
    entityNameError: string | null;
    selectedCollections: Set<string>;
}

function InitializeDraftButton({
    entityNameError,
    selectedCollections,
}: Props) {
    const navigate = useNavigate();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();
    const setCatalogName = useEditorStore_setCatalogName();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();

    // Transformation Create Store
    const language = useTransformationCreate_language();

    const entityName = useTransformationCreate_name();
    const catalogName = useTransformationCreate_catalogName();

    const addTransformConfigs = useTransformationCreate_addTransformConfigs();
    const setSelectedAttribute = useTransformationCreate_setSelectedAttribute();
    const setSourceCollections = useTransformationCreate_setSourceCollections();

    const validationErrorMessageId = useMemo(() => {
        if (selectedCollections.size < 1) {
            return 'newTransform.errors.collection';
        } else if (!entityName) {
            return 'newTransform.errors.name';
        } else {
            return null;
        }
    }, [entityName, selectedCollections]);

    const formInvalid = useMemo(
        () => Boolean(entityNameError ?? validationErrorMessageId),
        [entityNameError, validationErrorMessageId]
    );

    const initializeTransformation = useCallback(async (): Promise<void> => {
        setFormState({
            status: FormStatus.GENERATING,
            error: null,
            message: { key: null, severity: null },
        });

        if (catalogName) {
            const draftsResponse = await createEntityDraft(catalogName);

            if (draftsResponse.error) {
                // Set error state
            } else if (draftsResponse.data && draftsResponse.data.length > 0) {
                const draftId = draftsResponse.data[0].id;

                const collections = Array.from(selectedCollections);

                setSourceCollections(collections);
                setCatalogName(catalogName);

                const latestTransformVersions: { [tableName: string]: number } =
                    {};

                const transformConfigs: TransformConfig[] = collections.map(
                    (collection) => {
                        const tableName = stripPathing(collection);

                        if (Object.hasOwn(latestTransformVersions, tableName)) {
                            latestTransformVersions[tableName] += 1;
                        } else {
                            latestTransformVersions[tableName] = 0;
                        }

                        return templateTransformConfig(
                            collection,
                            entityName,
                            latestTransformVersions[tableName]
                        );
                    }
                );

                addTransformConfigs(transformConfigs);
                setSelectedAttribute(`${entityName}.lambda.0.sql`);

                const spec = generateInitialSpec(
                    language,
                    catalogName,
                    selectedCollections,
                    { existingTransforms: transformConfigs }
                );

                const draftSpecResponse = await createDraftSpec(
                    draftsResponse.data[0].id,
                    catalogName,
                    spec,
                    'collection'
                );

                if (draftSpecResponse.error) {
                    setFormState({
                        status: FormStatus.FAILED,
                        error: {
                            title: 'newTransform.errors.draftSpecCreateFailed',
                            error: draftSpecResponse.error,
                        },
                    });
                } else {
                    setDraftId(draftId);
                    setPersistedDraftId(draftId);

                    setFormState({ status: FormStatus.GENERATED });

                    // TODO (transform): Replace this with the navigate to create workflow hook and the production-ready URL
                    //   when it is time to launch this feature.
                    navigate(authenticatedRoutes.beta.new.fullPath);
                }
            } else {
                setFormState({ status: FormStatus.FAILED });
            }
        }
    }, [
        addTransformConfigs,
        catalogName,
        entityName,
        language,
        navigate,
        selectedCollections,
        setCatalogName,
        setDraftId,
        setFormState,
        setPersistedDraftId,
        setSelectedAttribute,
        setSourceCollections,
    ]);

    return (
        <SafeLoadingButton
            variant="contained"
            disabled={formInvalid}
            onClick={initializeTransformation}
        >
            <FormattedMessage id="cta.next" />
        </SafeLoadingButton>
    );
}

export default InitializeDraftButton;
