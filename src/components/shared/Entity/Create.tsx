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
    DetailsFormStoreNames,
    DraftEditorStoreNames,
    EndpointConfigStoreNames,
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
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { entityCreateStoreSelectors } from 'stores/Create';
import { DetailsFormState } from 'stores/DetailsForm';
import { EndpointConfigState } from 'stores/EndpointConfig';
import { ResourceConfigState } from 'stores/ResourceConfig';
import { ENTITY, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    title: string;
    connectorType: 'capture' | 'materialization';
    Header: any;
    draftEditorStoreName: DraftEditorStoreNames;
    endpointConfigStoreName: EndpointConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
    resourceConfigStoreName?: ResourceConfigStoreNames;
    showCollections?: boolean;
}

function EntityCreate({
    title,
    connectorType,
    Header,
    draftEditorStoreName,
    endpointConfigStoreName,
    detailsFormStoreName,
    resourceConfigStoreName,
    showCollections,
}: Props) {
    useBrowserTitle(title); //'browserTitle.captureCreate'

    // Supabase stuff
    const { combinedGrants } = useCombinedGrantsExt({
        adminOnly: true,
    });

    // Check for properties being passed in
    const [searchParams] = useSearchParams();
    const specId = searchParams.get(
        authenticatedRoutes.materializations.create.params.liveSpecId
    );
    const lastPubId = searchParams.get(
        authenticatedRoutes.materializations.create.params.lastPubId
    );

    const {
        connectorTags,
        error: connectorTagsError,
        isValidating,
    } = useConnectorWithTagDetail(connectorType);

    const useEntityCreateStore = useRouteStore();

    const imageTag = useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const logToken = useZustandStore<
        DetailsFormState,
        DetailsFormState['formState']['logToken']
    >(detailsFormStoreName, (state) => state.formState.logToken);

    const formSubmitError = useZustandStore<
        DetailsFormState,
        DetailsFormState['formState']['error']
    >(detailsFormStoreName, (state) => state.formState.error);

    const setEndpointSchema = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointSchema']
    >(endpointConfigStoreName, (state) => state.setEndpointSchema);

    // TODO: Determine proper placement for this logic.
    const setResourceSchema = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(
        resourceConfigStoreName ??
            ResourceConfigStoreNames.MATERIALIZATION_CREATE,
        (state) => state.setResourceSchema
    );

    const prefillCollections = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillCollections']
    >(
        resourceConfigStoreName ??
            ResourceConfigStoreNames.MATERIALIZATION_CREATE,
        (state) => state.preFillCollections
    );

    //Editor state
    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >(draftEditorStoreName, (state) => state.setId);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const { connectorTag } = useConnectorTag(imageTag ? imageTag.id : null);
    const { liveSpecs } = useLiveSpecsExtWithOutSpec(specId, ENTITY.CAPTURE);
    const { liveSpecs: liveSpecsByLastPub } = useLiveSpecsExtByLastPubId(
        lastPubId,
        ENTITY.CAPTURE
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
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    {imageTag?.id ? (
                        <ErrorBoundryWrapper>
                            <EndpointConfig
                                connectorImage={imageTag.id}
                                draftEditorStoreName={draftEditorStoreName}
                                endpointConfigStoreName={
                                    endpointConfigStoreName
                                }
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    {showCollections &&
                    resourceConfigStoreName &&
                    hasLength(imageTag?.id) ? (
                        <ErrorBoundryWrapper>
                            <CollectionConfig
                                resourceConfigStoreName={
                                    resourceConfigStoreName
                                }
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    <ErrorBoundryWrapper>
                        <CatalogEditor
                            messageId={`${messagePrefix}.finalReview.instructions`}
                            draftEditorStoreName={draftEditorStoreName}
                            detailsFormStoreName={detailsFormStoreName}
                        />
                    </ErrorBoundryWrapper>
                </>
            )}
        </>
    );
}

export default EntityCreate;
