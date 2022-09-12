import { Alert, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, updateDraftSpec } from 'api/draftSpecs';
import CollectionConfig from 'components/collection/Config';
import {
    EditorStoreState,
    useEditorStore_editDraftId,
    useEditorStore_id,
    useEditorStore_setEditDraftId,
    useEditorStore_setId,
} from 'components/editor/Store';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import { getConnectorImageDetails } from 'components/shared/Entity/DetailsForm/Form';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import useUnsavedChangesPrompt from 'components/shared/Entity/hooks/useUnsavedChangesPrompt';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import {
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorTag from 'hooks/useConnectorTag';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraft, { DraftQuery } from 'hooks/useDraft';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import {
    LiveSpecsExtQueryWithSpec,
    useLiveSpecsExtByLastPubId,
    useLiveSpecsExtWithSpec,
} from 'hooks/useLiveSpecsExt';
import { isEmpty, isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Details,
    useDetailsForm_connectorImage,
    useDetailsForm_setDetails,
} from 'stores/DetailsForm';
import { useEndpointConfigStore_setEndpointSchema } from 'stores/EndpointConfig';
import {
    EntityFormState,
    FormState,
    FormStatus,
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'stores/FormState';
import {
    ResourceConfigDictionary,
    ResourceConfigState,
} from 'stores/ResourceConfig';
import { ENTITY, JsonFormsData, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    title: string;
    entityType: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
    Header: any;
    formStateStoreName: FormStateStoreNames;
    callFailed: (formState: any, subscription?: RealtimeSubscription) => void;
    resourceConfigStoreName?: ResourceConfigStoreNames;
    showCollections?: boolean;
    promptDataLoss: any;
    resetState: () => void;
    readOnly: {
        detailsForm?: true;
        endpointConfigForm?: true;
        resourceConfigForm?: true;
    };
}

interface InitializationHelpers {
    setDraftId: (id: EditorStoreState<DraftSpecQuery>['id']) => void;
    setEditDraftId: (
        id: EditorStoreState<DraftSpecQuery>['editDraftId']
    ) => void;
    setFormState: (data: Partial<FormState>) => void;
    callFailed: (formState: any, subscription?: RealtimeSubscription) => void;
}

const initDraftToEdit = async (
    { catalog_name, spec }: LiveSpecsExtQueryWithSpec,
    entityType: ENTITY,
    drafts: DraftQuery[],
    draftSpecs: DraftSpecQuery[],
    lastPubId: string | null,
    {
        setDraftId,
        setEditDraftId,
        setFormState,
        callFailed,
    }: InitializationHelpers
) => {
    setFormState({ status: FormStatus.GENERATING });

    const errorTitle =
        entityType === ENTITY.MATERIALIZATION
            ? 'materializationEdit.generate.failure.errorTitle'
            : 'captureEdit.generate.failedErrorTitle';

    if (
        drafts.length === 0 ||
        draftSpecs.length === 0 ||
        lastPubId !== draftSpecs[0].expect_pub_id
    ) {
        const draftsResponse = await createEntityDraft(catalog_name);

        if (draftsResponse.error) {
            return callFailed({
                error: {
                    title: errorTitle,
                    error: draftsResponse.error,
                },
            });
        }

        const newDraftId = draftsResponse.data[0].id;

        const draftSpecResponse = await createDraftSpec(
            newDraftId,
            catalog_name,
            spec,
            entityType,
            lastPubId
        );

        if (draftSpecResponse.error) {
            return callFailed({
                error: {
                    title: errorTitle,
                    error: draftSpecResponse.error,
                },
            });
        }

        setDraftId(newDraftId);
        setEditDraftId(newDraftId);
    } else {
        const existingDraftId = drafts[0].id;

        const draftSpecResponse = await updateDraftSpec(
            existingDraftId,
            catalog_name,
            spec,
            lastPubId
        );

        if (draftSpecResponse.error) {
            return callFailed({
                error: {
                    title: errorTitle,
                    error: draftSpecResponse.error,
                },
            });
        }

        setDraftId(existingDraftId);
        setEditDraftId(existingDraftId);
    }
};

const evaluateResourceConfigEquality = (
    resourceConfig: ResourceConfigDictionary,
    queries: any[]
) => {
    const configEquality: boolean[] = queries.map((query) => {
        let queriedResourceConfig: ResourceConfigDictionary = {};

        query.spec.bindings.forEach((binding: any) => {
            queriedResourceConfig = {
                ...queriedResourceConfig,
                [binding.source]: {
                    data: binding.resource,
                    errors: [],
                },
            };
        });

        return isEqual(resourceConfig, queriedResourceConfig);
    });

    return configEquality.includes(true);
};

// eslint-disable-next-line complexity
function EntityEdit({
    title,
    entityType,
    Header,
    formStateStoreName,
    resourceConfigStoreName,
    callFailed,
    showCollections,
    readOnly,
    promptDataLoss,
    resetState,
}: Props) {
    useBrowserTitle(title);

    const [endpointConfig, setEndpointConfig] = useState<JsonFormsData | null>(
        null
    );

    // Supabase stuff
    const { combinedGrants } = useCombinedGrantsExt({
        adminOnly: true,
    });

    // Check for properties being passed in
    const [connectorId, liveSpecId, lastPubId] = useGlobalSearchParams([
        GlobalSearchParams.CONNECTOR_ID,
        GlobalSearchParams.LIVE_SPEC_ID,
        GlobalSearchParams.LAST_PUB_ID,
    ]);

    const {
        connectorTags,
        error: connectorTagsError,
        isValidating,
    } = useConnectorWithTagDetail(entityType);

    const {
        connectorTags: [initialConnectorTag],
    } = useConnectorWithTagDetail(entityType, connectorId);

    const {
        liveSpecs: [initialSpec],
    } = useLiveSpecsExtWithSpec(liveSpecId, entityType);

    const { drafts, isValidating: isValidatingDrafts } = useDraft(
        isEmpty(initialSpec) ? null : initialSpec.catalog_name
    );

    // Details Form Store
    const setDetails = useDetailsForm_setDetails();
    const imageTag = useDetailsForm_connectorImage();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const editDraftId = useEditorStore_editDraftId();
    const setEditDraftId = useEditorStore_setEditDraftId();

    // Endpoint Config Store
    const setEndpointSchema = useEndpointConfigStore_setEndpointSchema();

    // Form State Store
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const formStatus = useFormStateStore_status();

    const logToken = useFormStateStore_logToken();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const formSubmitError = useFormStateStore_error();

    const setFormState = useFormStateStore_setFormState();

    // Resource Config Store
    // TODO: Determine proper placement for this logic.
    const setResourceSchema = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(
        resourceConfigStoreName ?? ResourceConfigStoreNames.MATERIALIZATION,
        (state) => state.setResourceSchema
    );

    const setResourceConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(
        resourceConfigStoreName ?? ResourceConfigStoreNames.MATERIALIZATION,
        (state) => state.setResourceConfig
    );

    const preFillCollections = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillCollections']
    >(
        resourceConfigStoreName ?? ResourceConfigStoreNames.MATERIALIZATION,
        (state) => state.preFillCollections
    );

    const resourceConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(
        resourceConfigStoreName ?? ResourceConfigStoreNames.MATERIALIZATION,
        (state) => state.resourceConfig
    );

    const { draftSpecs, isValidating: isValidatingDraftSpecs } = useDraftSpecs(
        editDraftId,
        lastPubId
    );

    useEffect(() => {
        if (
            !isEmpty(initialSpec) &&
            !isValidatingDrafts &&
            !isValidatingDraftSpecs &&
            formStatus === FormStatus.INIT
        ) {
            void initDraftToEdit(
                initialSpec,
                entityType,
                drafts,
                draftSpecs,
                lastPubId,
                {
                    setDraftId,
                    setEditDraftId,
                    setFormState,
                    callFailed,
                }
            );
        }
    }, [
        setDraftId,
        setEditDraftId,
        setFormState,
        callFailed,
        initialSpec,
        entityType,
        drafts,
        draftSpecs,
        isValidatingDrafts,
        isValidatingDraftSpecs,
        formStatus,
        lastPubId,
    ]);

    useEffect(() => {
        if (!isEmpty(initialSpec) && !isEmpty(initialConnectorTag)) {
            const details: Details = {
                data: {
                    entityName: initialSpec.catalog_name,
                    connectorImage:
                        getConnectorImageDetails(initialConnectorTag),
                    description: initialSpec.detail || '',
                },
            };

            setDetails(details);
        }
    }, [setDetails, initialSpec, initialConnectorTag]);

    const { connectorTag } = useConnectorTag(imageTag.id);
    const { liveSpecs: liveSpecsByLastPub } = useLiveSpecsExtByLastPubId(
        lastPubId,
        entityType
    );

    useEffect(() => {
        if (
            connectorTag &&
            !isEmpty(initialSpec) &&
            !isEmpty(initialConnectorTag) &&
            (formStatus === FormStatus.GENERATING ||
                formStatus == FormStatus.GENERATED ||
                formStatus === FormStatus.FAILED)
        ) {
            setEndpointConfig(
                connectorTag.connector_id === initialConnectorTag.id
                    ? { data: initialSpec.spec.endpoint.connector.config }
                    : null
            );

            // TODO: Repair temporary typing.
            setEndpointSchema(
                connectorTag.endpoint_spec_schema as unknown as Schema
            );
            setResourceSchema(
                connectorTag.resource_spec_schema as unknown as Schema
            );

            // We wanna make sure we do these after the schemas are set as
            //  as they are dependent on them.
            if (
                entityType === ENTITY.MATERIALIZATION &&
                hasLength(draftSpecs)
            ) {
                if (isEmpty(resourceConfig)) {
                    initialSpec.spec.bindings.forEach((binding: any) =>
                        setResourceConfig(binding.source, {
                            data: binding.resource,
                            errors: [],
                        })
                    );

                    preFillCollections([initialSpec]);
                } else {
                    setDraftId(
                        evaluateResourceConfigEquality(resourceConfig, [
                            initialSpec,
                            draftSpecs[0],
                        ])
                            ? editDraftId
                            : null
                    );
                }
            }

            setFormState({ status: FormStatus.GENERATED });
        }
    }, [
        connectorTag,
        liveSpecsByLastPub,
        initialSpec,
        initialConnectorTag,
        entityType,
        resourceConfig,
        editDraftId,
        formStatus,
        draftSpecs,
        preFillCollections,
        setResourceConfig,
        setEndpointSchema,
        setResourceSchema,
        setDraftId,
        setFormState,
    ]);

    useUnsavedChangesPrompt(!exitWhenLogsClose && promptDataLoss, resetState);

    return (
        <>
            {Header}

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : isEmpty(initialSpec) || isEmpty(initialConnectorTag) ? null : (
                <>
                    <Collapse in={formSubmitError !== null}>
                        {formSubmitError ? (
                            <EntityError
                                title={formSubmitError.title}
                                error={formSubmitError.error}
                                logToken={logToken}
                                draftId={draftId}
                            />
                        ) : null}
                    </Collapse>

                    {!isValidating && connectorTags.length === 0 ? (
                        <Alert severity="warning">
                            <FormattedMessage
                                id={`${messagePrefix}.missingConnectors`}
                            />
                        </Alert>
                    ) : connectorTags.length > 0 ? (
                        <ErrorBoundryWrapper>
                            <DetailsForm
                                connectorTags={connectorTags}
                                accessGrants={combinedGrants}
                                formStateStoreName={formStateStoreName}
                                readOnly={readOnly.detailsForm}
                                entityType={entityType}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    {imageTag.id ? (
                        <ErrorBoundryWrapper>
                            <EndpointConfig
                                connectorImage={imageTag.id}
                                readOnly={readOnly.endpointConfigForm}
                                initialEndpointConfig={endpointConfig}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    {showCollections &&
                    resourceConfigStoreName &&
                    hasLength(imageTag.id) ? (
                        <ErrorBoundryWrapper>
                            <CollectionConfig
                                resourceConfigStoreName={
                                    resourceConfigStoreName
                                }
                                formStateStoreName={formStateStoreName}
                                readOnly={readOnly.resourceConfigForm}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    <ErrorBoundryWrapper>
                        <CatalogEditor
                            messageId={`${messagePrefix}.finalReview.instructions`}
                        />
                    </ErrorBoundryWrapper>
                </>
            )}
        </>
    );
}

export default EntityEdit;
