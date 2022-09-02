import { Alert, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, updateDraftSpec } from 'api/draftSpecs';
import { authenticatedRoutes } from 'app/Authenticated';
import CollectionConfig from 'components/collection/Config';
import { EditorStoreState } from 'components/editor/Store';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm, {
    getConnectorImageDetails,
} from 'components/shared/Entity/DetailsForm';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import {
    DraftEditorStoreNames,
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
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
import { useSearchParams } from 'react-router-dom';
import {
    Details,
    useDetailsForm_connectorImage,
    useDetailsForm_setDetails,
} from 'stores/DetailsForm';
import { useEndpointConfigStore_setEndpointSchema } from 'stores/EndpointConfig';
import { EntityFormState, FormState, FormStatus } from 'stores/FormState';
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
    draftEditorStoreName: DraftEditorStoreNames;
    formStateStoreName: FormStateStoreNames;
    callFailed: (formState: any, subscription?: RealtimeSubscription) => void;
    resourceConfigStoreName?: ResourceConfigStoreNames;
    showCollections?: boolean;
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

function EntityEdit({
    title,
    entityType,
    Header,
    draftEditorStoreName,
    formStateStoreName,
    resourceConfigStoreName,
    callFailed,
    showCollections,
    readOnly,
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
    const [searchParams] = useSearchParams();
    const connectorId =
        searchParams.get(
            authenticatedRoutes.captures.edit.params.connectorId
        ) ??
        searchParams.get(
            authenticatedRoutes.materializations.edit.params.connectorId
        );

    const liveSpecId =
        searchParams.get(authenticatedRoutes.captures.edit.params.liveSpecId) ??
        searchParams.get(
            authenticatedRoutes.materializations.edit.params.liveSpecId
        );

    const lastPubId =
        searchParams.get(authenticatedRoutes.captures.edit.params.lastPubId) ??
        searchParams.get(
            authenticatedRoutes.materializations.edit.params.lastPubId
        );

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
    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >(draftEditorStoreName, (state) => state.setId);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    const setEditDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setEditDraftId']
    >(draftEditorStoreName, (state) => state.setEditDraftId);

    const editDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['editDraftId']
    >(draftEditorStoreName, (state) => state.editDraftId);

    // Endpoint Config Store
    const setEndpointSchema = useEndpointConfigStore_setEndpointSchema();

    // Form State Store
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const logToken = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['logToken']
    >(formStateStoreName, (state) => state.formState.logToken);

    const formSubmitError = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['error']
    >(formStateStoreName, (state) => state.formState.error);

    const setFormState = useZustandStore<
        EntityFormState,
        EntityFormState['setFormState']
    >(formStateStoreName, (state) => state.setFormState);

    const formStatus = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['status']
    >(formStateStoreName, (state) => state.formState.status);

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
                                draftEditorStoreName={draftEditorStoreName}
                                formStateStoreName={formStateStoreName}
                                readOnly={readOnly.detailsForm}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    {imageTag.id ? (
                        <ErrorBoundryWrapper>
                            <EndpointConfig
                                connectorImage={imageTag.id}
                                draftEditorStoreName={draftEditorStoreName}
                                formStateStoreName={formStateStoreName}
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
                            draftEditorStoreName={draftEditorStoreName}
                            formStateStoreName={formStateStoreName}
                        />
                    </ErrorBoundryWrapper>
                </>
            )}
        </>
    );
}

export default EntityEdit;
