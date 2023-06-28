import { LoadingButton } from '@mui/lab';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { authenticatedRoutes } from 'app/routes';
import {
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
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
    selectedCollections: Set<string>;
    setSQLEditorOpen?: Dispatch<SetStateAction<boolean>>;
}

function InitializeDraftButton({
    entityNameError,
    selectedCollections,
    setSQLEditorOpen,
}: Props) {
    const navigate = useNavigate();

    // Transformation Create Store
    const language = useTransformationCreate_language();

    const entityName = useTransformationCreate_name();
    const catalogName = useTransformationCreate_catalogName();

    const addTransformConfigs = useTransformationCreate_addTransformConfigs();
    const setSelectedAttribute = useTransformationCreate_setSelectedAttribute();
    const setSourceCollections = useTransformationCreate_setSourceCollections();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

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
        if (catalogName) {
            const draftsResponse = await createEntityDraft(catalogName);

            if (draftsResponse.error) {
                // Set error state
            } else if (draftsResponse.data && draftsResponse.data.length > 0) {
                const draftId = draftsResponse.data[0].id;

                const collections = Array.from(selectedCollections);

                setSourceCollections(collections);

                let latestTransformVersions: { [tableName: string]: number } =
                    {};

                const transformConfigs: TransformConfig[] = collections.map(
                    (collection) => {
                        const tableName = stripPathing(collection);

                        if (Object.hasOwn(latestTransformVersions, tableName)) {
                            latestTransformVersions[tableName] += 1;
                        } else {
                            latestTransformVersions = {
                                ...latestTransformVersions,
                                [tableName]: 0,
                            };
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
                    selectedCollections
                );

                const draftSpecResponse = await createDraftSpec(
                    draftsResponse.data[0].id,
                    catalogName,
                    spec,
                    'collection'
                );

                if (draftSpecResponse.error) {
                    // Set error state
                } else {
                    setDraftId(draftId);
                    setPersistedDraftId(draftId);

                    if (setSQLEditorOpen) {
                        setSQLEditorOpen(true);
                    }

                    // TODO (transform): Replace this with the navigate to create workflow hook and the production-ready URL
                    //   when it is time to launch this feature.
                    navigate(authenticatedRoutes.beta.new.fullPath);
                }
            } else {
                // Set error state
            }
        }
    }, [
        addTransformConfigs,
        setDraftId,
        setSQLEditorOpen,
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
