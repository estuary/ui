import { Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, updateDraftSpec } from 'api/draftSpecs';
import CollectionConfig from 'components/collection/Config';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { EditorStoreState } from 'components/editor/Store/types';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import { getConnectorImageDetails } from 'components/shared/Entity/DetailsForm/Form';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import useUnsavedChangesPrompt from 'components/shared/Entity/hooks/useUnsavedChangesPrompt';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraft, { DraftQuery } from 'hooks/useDraft';
import { DraftSpecQuery, DraftSpecSwrMetadata } from 'hooks/useDraftSpecs';
import {
    LiveSpecsExtQueryWithSpec,
    useLiveSpecsExtWithSpec,
} from 'hooks/useLiveSpecsExt';
import { isEmpty } from 'lodash';
import { ReactNode, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import {
    Details,
    useDetailsForm_changed,
    useDetailsForm_connectorImage,
    useDetailsForm_setDetails,
} from 'stores/DetailsForm';
import {
    useEndpointConfigStore_changed,
    useEndpointConfig_hydrated,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormState, FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_hydrated,
    useResourceConfig_serverUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { Entity, EntityWithCreateWorkflow } from 'types';
import { hasLength } from 'utils/misc-utils';
import AlertBox from '../AlertBox';

interface Props {
    title: string;
    entityType: EntityWithCreateWorkflow;
    readOnly: {
        detailsForm?: true;
        endpointConfigForm?: true;
        resourceConfigForm?: true;
    };
    draftSpecMetadata: Pick<
        DraftSpecSwrMetadata,
        'draftSpecs' | 'isValidating' | 'error'
    >;
    callFailed: (formState: any, subscription?: RealtimeSubscription) => void;
    resetState: () => void;
    errorSummary: ReactNode;
    toolbar: ReactNode;
    RediscoverButton?: ReactNode;
}

interface DiscoveryData {
    draft_id: string;
}

interface InitializationHelpers {
    setDraftId: (id: EditorStoreState<DraftSpecQuery>['id']) => void;
    setFormState: (data: Partial<FormState>) => void;
    setPersistedDraftId: (
        id: EditorStoreState<DraftSpecQuery>['persistedDraftId']
    ) => void;
    callFailed: (formState: any, subscription?: RealtimeSubscription) => void;
}

const createDraftToEdit = async (
    catalogName: string,
    spec: any,
    entityType: Entity,
    lastPubId: string | null,
    errorTitle: string,
    {
        setDraftId,
        setFormState,
        setPersistedDraftId,
        callFailed,
    }: InitializationHelpers
) => {
    const draftsResponse = await createEntityDraft(catalogName);

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
        catalogName,
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
    setPersistedDraftId(newDraftId);

    setFormState({ status: FormStatus.GENERATED });
};

const initDraftToEdit = async (
    { catalog_name, spec }: LiveSpecsExtQueryWithSpec,
    entityType: Entity,
    drafts: DraftQuery[],
    draftSpecs: DraftSpecQuery[],
    lastPubId: string | null,
    {
        setDraftId,
        setFormState,
        setPersistedDraftId,
        callFailed,
    }: InitializationHelpers
) => {
    setFormState({ status: FormStatus.GENERATING });

    const errorTitle =
        entityType === 'materialization'
            ? 'materializationEdit.generate.failure.errorTitle'
            : 'captureEdit.generate.failedErrorTitle';

    // TODO (defect): Correct this initialization logic so that a new draft
    //   is not created when the browser is refreshed.

    if (
        drafts.length === 0 ||
        draftSpecs.length === 0 ||
        lastPubId !== draftSpecs[0].expect_pub_id
    ) {
        void createDraftToEdit(
            catalog_name,
            spec,
            entityType,
            lastPubId,
            errorTitle,
            { setDraftId, setFormState, setPersistedDraftId, callFailed }
        );
    } else {
        const existingDraftId = drafts[0].id;

        const discoveryResponse = await supabaseClient
            .from(TABLES.DISCOVERS)
            .select(`draft_id`)
            .match({
                draft_id: existingDraftId,
            })
            .then(handleSuccess<DiscoveryData[]>, handleFailure);

        if (discoveryResponse.data && discoveryResponse.data.length > 0) {
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
            setPersistedDraftId(existingDraftId);
        } else {
            void createDraftToEdit(
                catalog_name,
                spec,
                entityType,
                lastPubId,
                errorTitle,
                { setDraftId, setFormState, setPersistedDraftId, callFailed }
            );
        }
    }
};

// eslint-disable-next-line complexity
function EntityEdit({
    title,
    entityType,
    readOnly,
    draftSpecMetadata,
    callFailed,
    resetState,
    errorSummary,
    toolbar,
    RediscoverButton,
}: Props) {
    useBrowserTitle(title);

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
    const imageTag = useDetailsForm_connectorImage();
    const setDetails = useDetailsForm_setDetails();
    const detailsFormChanged = useDetailsForm_changed();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const persistedDraftId = useEditorStore_persistedDraftId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    // Endpoint Config Store
    const endpointConfigStoreHydrated = useEndpointConfig_hydrated();
    const endpointConfigChanged = useEndpointConfigStore_changed();
    const endpointConfigServerUpdateRequired =
        useEndpointConfig_serverUpdateRequired();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const formStatus = useFormStateStore_status();

    const logToken = useFormStateStore_logToken();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const formSubmitError = useFormStateStore_error();

    const setFormState = useFormStateStore_setFormState();

    // Resource Config Store
    const resourceConfigStoreHydrated = useResourceConfig_hydrated();
    const resourceConfigServerUpdateRequired =
        useResourceConfig_serverUpdateRequired();

    const { draftSpecs, isValidating: isValidatingDraftSpecs } =
        draftSpecMetadata;

    const taskDraftSpec = useMemo(
        () => draftSpecs.filter(({ spec_type }) => spec_type === entityType),
        [draftSpecs, entityType]
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
                taskDraftSpec,
                lastPubId,
                {
                    setDraftId,
                    setFormState,
                    setPersistedDraftId,
                    callFailed,
                }
            );
        }
    }, [
        setDraftId,
        setFormState,
        setPersistedDraftId,
        callFailed,
        drafts,
        taskDraftSpec,
        entityType,
        formStatus,
        initialSpec,
        isValidatingDrafts,
        isValidatingDraftSpecs,
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

    useEffect(() => {
        const resetDraftIdFlag =
            endpointConfigServerUpdateRequired ||
            resourceConfigServerUpdateRequired;

        setDraftId(resetDraftIdFlag ? null : persistedDraftId);
    }, [
        setDraftId,
        endpointConfigServerUpdateRequired,
        persistedDraftId,
        resourceConfigServerUpdateRequired,
    ]);

    // TODO (defect): Trigger the prompt data loss modal if the resource config section changes.
    const promptDataLoss = detailsFormChanged() || endpointConfigChanged();

    useUnsavedChangesPrompt(!exitWhenLogsClose && promptDataLoss, resetState);

    const storeHydrationIncomplete =
        !endpointConfigStoreHydrated || !resourceConfigStoreHydrated;

    return (
        <>
            {toolbar}

            {errorSummary}

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : !persistedDraftId || storeHydrationIncomplete ? null : (
                <>
                    <Collapse in={formSubmitError !== null}>
                        {formSubmitError ? (
                            <EntityError
                                title={formSubmitError.title}
                                error={formSubmitError.error}
                                logToken={logToken}
                                draftId={persistedDraftId}
                            />
                        ) : null}
                    </Collapse>

                    {!isValidating && connectorTags.length === 0 ? (
                        <AlertBox severity="warning" short>
                            <FormattedMessage
                                id={`${messagePrefix}.missingConnectors`}
                            />
                        </AlertBox>
                    ) : connectorTags.length > 0 ? (
                        <ErrorBoundryWrapper>
                            <DetailsForm
                                connectorTags={connectorTags}
                                accessGrants={combinedGrants}
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
                                hideBorder={!hasLength(imageTag.id)}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    {hasLength(imageTag.id) ? (
                        <ErrorBoundryWrapper>
                            <CollectionConfig
                                draftSpecs={taskDraftSpec}
                                readOnly={readOnly.resourceConfigForm}
                                hideBorder={!draftId}
                                RediscoverButton={RediscoverButton}
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
