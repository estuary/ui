import { LoadingButton } from '@mui/lab';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { authenticatedRoutes } from 'app/routes';
import {
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useTransformationCreate_addTransformConfigs,
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
    useTransformationCreate_name,
    useTransformationCreate_setSelectedAttribute,
    useTransformationCreate_setSourceCollections,
} from 'stores/TransformationCreate/hooks';
import { TransformConfig } from 'stores/TransformationCreate/types';
import {
    generateInitialSpec,
    templateTransformConfig,
} from 'utils/derivation-utils';
import { stripPathing } from 'utils/misc-utils';

interface Props {
    entityNameError: string | null;
    selectedCollections: string[];
}

function InitializeDraftButton({
    entityNameError,
    selectedCollections,
}: Props) {
    const navigate = useNavigate();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

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
        if (selectedCollections.length < 1) {
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

                setSourceCollections(selectedCollections);

                const latestTransformVersions: { [tableName: string]: number } =
                    {};

                const transformConfigs: TransformConfig[] =
                    selectedCollections.map((collection) => {
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
                    });

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
        setDraftId,
        setFormState,
        setPersistedDraftId,
        setSelectedAttribute,
        setSourceCollections,
        catalogName,
        entityName,
        language,
        navigate,
        selectedCollections,
    ]);

    return (
        <LoadingButton
            variant="contained"
            disabled={formInvalid}
            onClick={initializeTransformation}
        >
            <FormattedMessage id="cta.next" />
        </LoadingButton>
    );
}

export default InitializeDraftButton;
