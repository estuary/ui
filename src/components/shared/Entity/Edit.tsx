import { Alert, Collapse } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import CollectionConfig from 'components/collection/Config';
import { EditorStoreState } from 'components/editor/Store';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
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
    useLiveSpecsExtByLastPubId,
    useLiveSpecsExtWithOutSpec,
} from 'hooks/useLiveSpecsExt';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import { useEndpointConfigStore_setEndpointSchema } from 'stores/EndpointConfig';
import { EntityFormState } from 'stores/FormState';
import { ResourceConfigState } from 'stores/ResourceConfig';
import { ENTITY, Schema } from 'types';
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
    useBrowserTitle(title); //'browserTitle.captureCreate'

    // Supabase stuff
    const { combinedGrants } = useCombinedGrantsExt({
        adminOnly: true,
    });

    // Check for properties being passed in
    const [searchParams] = useSearchParams();
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

    // Details Form Store
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

    // Resource Config Store
    // TODO: Determine proper placement for this logic.
    const setResourceSchema = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(
        resourceConfigStoreName ?? ResourceConfigStoreNames.MATERIALIZATION,
        (state) => state.setResourceSchema
    );

    const prefillCollections = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillCollections']
    >(
        resourceConfigStoreName ?? ResourceConfigStoreNames.MATERIALIZATION,
        (state) => state.preFillCollections
    );

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const { connectorTag } = useConnectorTag(imageTag.id);
    const { liveSpecs } = useLiveSpecsExtWithOutSpec(specId, entityType);
    const { liveSpecs: liveSpecsByLastPub } = useLiveSpecsExtByLastPubId(
        lastPubId,
        entityType
    );

    useEffect(() => {
        if (connectorTag) {
            // TODO: Repair temporary typing.
            setEndpointSchema(
                connectorTag.endpoint_spec_schema as unknown as Schema
            );
            setResourceSchema(
                connectorTag.resource_spec_schema as unknown as Schema
            );

            // We wanna make sure we do these after the schemas are set as
            //  as they are dependent on them.
            if (liveSpecs.length > 0) {
                prefillCollections(liveSpecs);
            } else if (liveSpecsByLastPub.length > 0) {
                prefillCollections(liveSpecsByLastPub);
            }
        }
    }, [
        connectorTag,
        liveSpecs,
        liveSpecsByLastPub,
        prefillCollections,
        setEndpointSchema,
        setResourceSchema,
    ]);

    return (
        <>
            {Header}

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : (
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
