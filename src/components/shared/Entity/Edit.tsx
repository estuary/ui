import { Alert, Collapse } from '@mui/material';
import { createEntityDraft, deleteEntityDraft } from 'api/drafts';
import { createDraftSpec, deleteDraftSpec } from 'api/draftSpecs';
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
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import {
    LiveSpecsExtQueryWithSpec,
    useLiveSpecsExtByLastPubId,
    useLiveSpecsExtWithOutSpec,
    useLiveSpecsExtWithSpec,
} from 'hooks/useLiveSpecsExt';
import { isEmpty, isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
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
    resourceConfigStoreName?: ResourceConfigStoreNames;
    showCollections?: boolean;
    readOnly: {
        detailsForm?: true;
        endpointConfigForm?: true;
        resourceConfigForm?: true;
    };
}

const createDraftToEdit = async (
    liveSpecInfo: LiveSpecsExtQueryWithSpec,
    entityType: ENTITY,
    setDraftId: (id: EditorStoreState<DraftSpecQuery>['id']) => void,
    setEditDraftId: (
        id: EditorStoreState<DraftSpecQuery>['editDraftId']
    ) => void,
    setFormState: (data: Partial<FormState>) => void
) => {
    const draftsResponse = await createEntityDraft(liveSpecInfo.catalog_name);

    if (draftsResponse.error) {
        // TODO: Handle supabase service error.
        console.log('There is a drafts table error.');
    }

    const newDraftId = draftsResponse.data[0].id;

    const draftSpecResponse = await createDraftSpec(
        newDraftId,
        liveSpecInfo.catalog_name,
        liveSpecInfo.spec,
        entityType
    );

    if (draftSpecResponse.error) {
        // TODO: Handle supabase service error.
        console.log('There is a drafts-spec table error.');
    }

    setDraftId(newDraftId);
    setEditDraftId(newDraftId);
    setFormState({ status: FormStatus.INIT });
};

const deleteEditDraft = async (draftId: string) => {
    const draftsResponse = await deleteEntityDraft(draftId);

    if (draftsResponse.error) {
        // TODO: Handle supabase service error.
        console.log('There is a drafts table error.');
    }

    const draftSpecResponse = await deleteDraftSpec(draftId);

    if (draftSpecResponse.error) {
        // TODO: Handle supabase service error.
        console.log('There is a drafts-spec table error.');
    }
};

function EntityEdit({
    title,
    entityType,
    Header,
    draftEditorStoreName,
    formStateStoreName,
    resourceConfigStoreName,
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

    const specId =
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
        // error: connectorTagsError,
        // isValidating,
    } = useConnectorWithTagDetail(entityType, connectorId);

    const {
        liveSpecs: [liveSpecInfo],
    } = useLiveSpecsExtWithSpec(specId, entityType);

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

    useEffect(() => {
        if (!isEmpty(liveSpecInfo)) {
            void createDraftToEdit(
                liveSpecInfo,
                entityType,
                setDraftId,
                setEditDraftId,
                setFormState
            );
        }
    }, [setDraftId, setEditDraftId, setFormState, liveSpecInfo, entityType]);

    useEffect(() => {
        if (!isEmpty(liveSpecInfo) && !isEmpty(initialConnectorTag)) {
            const details: Details = {
                data: {
                    entityName: liveSpecInfo.catalog_name,
                    connectorImage:
                        getConnectorImageDetails(initialConnectorTag),
                    description: liveSpecInfo.detail || '',
                },
            };

            setDetails(details);
        }
    }, [setDetails, liveSpecInfo, initialConnectorTag]);

    const { connectorTag } = useConnectorTag(imageTag.id);
    const { liveSpecs } = useLiveSpecsExtWithOutSpec(specId, entityType);
    const { liveSpecs: liveSpecsByLastPub } = useLiveSpecsExtByLastPubId(
        lastPubId,
        entityType
    );

    useEffect(() => {
        if (
            connectorTag &&
            !isEmpty(liveSpecInfo) &&
            !isEmpty(initialConnectorTag)
        ) {
            setEndpointConfig(
                connectorTag.connector_id === initialConnectorTag.id
                    ? { data: liveSpecInfo.spec.endpoint.connector.config }
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
            if (entityType === ENTITY.MATERIALIZATION && liveSpecs.length > 0) {
                console.log(liveSpecs);
                if (isEmpty(resourceConfig)) {
                    liveSpecs.forEach((data) =>
                        data.spec.bindings.forEach((binding: any) =>
                            setResourceConfig(binding.source, {
                                data: binding.resource,
                                errors: [],
                            })
                        )
                    );

                    preFillCollections(liveSpecs);
                } else {
                    let existingResourceConfig: ResourceConfigDictionary = {};

                    liveSpecs.forEach((data) =>
                        data.spec.bindings.forEach((binding: any) => {
                            existingResourceConfig = {
                                ...existingResourceConfig,
                                [binding.source]: {
                                    data: binding.resource,
                                    errors: [],
                                },
                            };
                        })
                    );

                    setDraftId(
                        isEqual(resourceConfig, existingResourceConfig)
                            ? editDraftId
                            : null
                    );
                }
            }
        }
    }, [
        connectorTag,
        liveSpecs,
        liveSpecsByLastPub,
        liveSpecInfo,
        initialConnectorTag,
        entityType,
        resourceConfig,
        editDraftId,
        preFillCollections,
        setResourceConfig,
        setEndpointSchema,
        setResourceSchema,
        setDraftId,
    ]);

    // TODO: Enable delete on exit.
    useEffectOnce(() => {
        return () => {
            if (editDraftId) {
                void deleteEditDraft(editDraftId);
            }
        };
    });

    return (
        <>
            {Header}

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : isEmpty(liveSpecInfo) || isEmpty(initialConnectorTag) ? null : (
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
