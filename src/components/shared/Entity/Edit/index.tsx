import { Box, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import CollectionConfig from 'components/collection/Config';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import DraftInitializer from 'components/shared/Entity/Edit/DraftInitializer';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import useUnsavedChangesPrompt from 'components/shared/Entity/hooks/useUnsavedChangesPrompt';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecSwrMetadata } from 'hooks/useDraftSpecs';
import { ReactNode, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useDetailsForm_changed,
    useDetailsForm_connectorImage,
    useDetailsForm_hydrated,
} from 'stores/DetailsForm/hooks';
import {
    useEndpointConfigStore_changed,
    useEndpointConfig_hydrated,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
} from 'stores/FormState/hooks';
import {
    useResourceConfig_hydrated,
    useResourceConfig_serverUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { EntityWithCreateWorkflow } from 'types';
import { hasLength } from 'utils/misc-utils';
import AlertBox from '../../AlertBox';

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

// interface DiscoveryData {
//     draft_id: string;
// }

// interface InitializationHelpers {
//     setDraftId: (id: EditorStoreState<DraftSpecQuery>['id']) => void;
//     setFormState: (data: Partial<FormState>) => void;
//     setPersistedDraftId: (
//         id: EditorStoreState<DraftSpecQuery>['persistedDraftId']
//     ) => void;
//     callFailed: (formState: any, subscription?: RealtimeSubscription) => void;
// }

// const createDraftToEdit = async (
//     catalogName: string,
//     spec: any,
//     entityType: Entity,
//     lastPubId: string | null,
//     errorTitle: string,
//     {
//         setDraftId,
//         setFormState,
//         setPersistedDraftId,
//         callFailed,
//     }: InitializationHelpers
// ) => {
//     const draftsResponse = await createEntityDraft(catalogName);

//     if (draftsResponse.error) {
//         return callFailed({
//             error: {
//                 title: errorTitle,
//                 error: draftsResponse.error,
//             },
//         });
//     }

//     const newDraftId = draftsResponse.data[0].id;

//     const draftSpecResponse = await createDraftSpec(
//         newDraftId,
//         catalogName,
//         spec,
//         entityType,
//         lastPubId
//     );

//     if (draftSpecResponse.error) {
//         return callFailed({
//             error: {
//                 title: errorTitle,
//                 error: draftSpecResponse.error,
//             },
//         });
//     }

//     setDraftId(newDraftId);
//     setPersistedDraftId(newDraftId);

//     setFormState({ status: FormStatus.GENERATED });
// };

// const initDraftToEdit = async (
//     { catalog_name, spec }: LiveSpecsExtQueryWithSpec,
//     entityType: Entity,
//     drafts: DraftQuery[],
//     draftSpecs: DraftSpecQuery[],
//     lastPubId: string | null,
//     {
//         setDraftId,
//         setFormState,
//         setPersistedDraftId,
//         callFailed,
//     }: InitializationHelpers
// ) => {
//     setFormState({ status: FormStatus.GENERATING });

//     const errorTitle =
//         entityType === 'materialization'
//             ? 'materializationEdit.generate.failure.errorTitle'
//             : 'captureEdit.generate.failedErrorTitle';

//     // TODO (defect): Correct this initialization logic so that a new draft
//     //   is not created when the browser is refreshed.

//     if (
//         drafts.length === 0 ||
//         draftSpecs.length === 0 ||
//         lastPubId !== draftSpecs[0].expect_pub_id
//     ) {
//         void createDraftToEdit(
//             catalog_name,
//             spec,
//             entityType,
//             lastPubId,
//             errorTitle,
//             { setDraftId, setFormState, setPersistedDraftId, callFailed }
//         );
//     } else {
//         const existingDraftId = drafts[0].id;

//         const discoveryResponse = await supabaseClient
//             .from(TABLES.DISCOVERS)
//             .select(`draft_id`)
//             .match({
//                 draft_id: existingDraftId,
//             })
//             .then(handleSuccess<DiscoveryData[]>, handleFailure);

//         if (discoveryResponse.data && discoveryResponse.data.length > 0) {
//             const draftSpecResponse = await updateDraftSpec(
//                 existingDraftId,
//                 catalog_name,
//                 spec,
//                 lastPubId
//             );

//             if (draftSpecResponse.error) {
//                 return callFailed({
//                     error: {
//                         title: errorTitle,
//                         error: draftSpecResponse.error,
//                     },
//                 });
//             }

//             setDraftId(existingDraftId);
//             setPersistedDraftId(existingDraftId);
//         } else {
//             void createDraftToEdit(
//                 catalog_name,
//                 spec,
//                 entityType,
//                 lastPubId,
//                 errorTitle,
//                 { setDraftId, setFormState, setPersistedDraftId, callFailed }
//             );
//         }
//     }
// };

// eslint-disable-next-line complexity
function EntityEdit({
    title,
    entityType,
    readOnly,
    draftSpecMetadata,
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

    const {
        connectorTags,
        error: connectorTagsError,
        isValidating,
    } = useConnectorWithTagDetail(entityType);

    // const { drafts, isValidating: isValidatingDrafts } = useDraft(
    //     isEmpty(initialSpec) ? null : initialSpec.catalog_name
    // );

    // Details Form Store
    const detailsFormStoreHydrated = useDetailsForm_hydrated();
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormChanged = useDetailsForm_changed();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const persistedDraftId = useEditorStore_persistedDraftId();
    // const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    // Endpoint Config Store
    const endpointConfigStoreHydrated = useEndpointConfig_hydrated();
    const endpointConfigChanged = useEndpointConfigStore_changed();
    const endpointConfigServerUpdateRequired =
        useEndpointConfig_serverUpdateRequired();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    // const formStatus = useFormStateStore_status();

    const logToken = useFormStateStore_logToken();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const formSubmitError = useFormStateStore_error();

    // const setFormState = useFormStateStore_setFormState();

    // Resource Config Store
    const resourceConfigStoreHydrated = useResourceConfig_hydrated();
    const resourceConfigServerUpdateRequired =
        useResourceConfig_serverUpdateRequired();

    const { draftSpecs } = draftSpecMetadata;

    const taskDraftSpec = useMemo(
        () => draftSpecs.filter(({ spec_type }) => spec_type === entityType),
        [draftSpecs, entityType]
    );

    // useEffect(() => {
    //     if (
    //         !isEmpty(initialSpec) &&
    //         !isValidatingDrafts &&
    //         !isValidatingDraftSpecs &&
    //         formStatus === FormStatus.INIT
    //     ) {
    //         void initDraftToEdit(
    //             initialSpec,
    //             entityType,
    //             drafts,
    //             taskDraftSpec,
    //             lastPubId,
    //             {
    //                 setDraftId,
    //                 setFormState,
    //                 setPersistedDraftId,
    //                 callFailed,
    //             }
    //         );
    //     }
    // }, [
    //     setDraftId,
    //     setFormState,
    //     setPersistedDraftId,
    //     callFailed,
    //     drafts,
    //     taskDraftSpec,
    //     entityType,
    //     formStatus,
    //     initialSpec,
    //     isValidatingDrafts,
    //     isValidatingDraftSpecs,
    //     lastPubId,
    // ]);

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

    console.log('end', endpointConfigChanged());
    console.log('det', detailsFormChanged());

    useUnsavedChangesPrompt(!exitWhenLogsClose && promptDataLoss, resetState);

    const storeHydrationIncomplete =
        !detailsFormStoreHydrated ||
        !endpointConfigStoreHydrated ||
        !resourceConfigStoreHydrated;

    return (
        <DraftInitializer>
            {toolbar}

            <Box sx={{ mb: 4 }}>{errorSummary}</Box>

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

                    {imageTag.connectorId ? (
                        <ErrorBoundryWrapper>
                            <EndpointConfig
                                connectorImage={imageTag.id}
                                readOnly={readOnly.endpointConfigForm}
                                hideBorder={!hasLength(imageTag.connectorId)}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}

                    {hasLength(imageTag.connectorId) ? (
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
        </DraftInitializer>
    );
}

export default EntityEdit;
