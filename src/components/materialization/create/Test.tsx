import { Button, SxProps, Theme } from '@mui/material';
import { EditorStoreState } from 'components/editor/Store';
import { useClient } from 'hooks/supabase-swr';
import useConnectorTags from 'hooks/useConnectorTags';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { getEncryptedConfig } from 'services/encryption';
import { TABLES } from 'services/supabase';
import {
    entityCreateStoreSelectors,
    formInProgress,
    FormStatus,
} from 'stores/Create';

interface Props {
    disabled: boolean;
    formId: string;
    onFailure: Function;
}

const buttonSx: SxProps<Theme> = { ml: 1, borderRadius: 5 };

function Test({ disabled, formId, onFailure }: Props) {
    // Supabase
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorTags('materialization');

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const entityCreateStore = useRouteStore();

    // Materializations store
    const resourceConfig = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.get
    );
    const formStateStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );

    // Form store
    const entityName = entityCreateStore(
        entityCreateStoreSelectors.details.entityName
    );
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const endpointConfig = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const endpointSchema = entityCreateStore(
        entityCreateStoreSelectors.endpointSchema
    );
    const [detailErrors, specErrors] = entityCreateStore(
        entityCreateStoreSelectors.errors
    );

    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );

    // Editor state

    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    const test = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        let detailHasErrors = false;
        let specHasErrors = false;

        // TODO - this was to make TS/Linting happy
        detailHasErrors = detailErrors ? detailErrors.length > 0 : false;
        specHasErrors = specErrors ? specErrors.length > 0 : false;

        const connectorInfo = connectorTags.find(
            ({ id }: { id: any }) => id === imageTag?.id
        );

        if (detailHasErrors || specHasErrors) {
            setFormState({
                status: FormStatus.IDLE,
                displayValidation: true,
            });
        } else if (isEmpty(resourceConfig)) {
            // TODO: Handle the scenario where no collections are present.
            setFormState({
                status: FormStatus.IDLE,
                displayValidation: true,
            });
        } else if (!connectorInfo) {
            // TODO: Handle the highly unlikely scenario where the connector tag id could not be found.
            setFormState({
                status: FormStatus.IDLE,
                displayValidation: true,
            });
        } else {
            setFormState({
                status: FormStatus.GENERATING_PREVIEW,
            });
            setDraftId(null);

            const {
                connectors: { image_name },
                image_tag,
            } = connectorInfo;

            supabaseClient
                .from(TABLES.DRAFTS)
                .insert({
                    detail: entityName,
                })
                .then(
                    async (draftsResponse) => {
                        if (
                            draftsResponse.data &&
                            draftsResponse.data.length > 0
                        ) {
                            getEncryptedConfig({
                                data: {
                                    schema: endpointSchema,
                                    config: endpointConfig,
                                },
                            })
                                .then((encryptedEndpointConfig) => {
                                    const newDraftId =
                                        draftsResponse.data[0].id;

                                    // TODO (typing) MaterializationDef
                                    const draftSpec: any = {
                                        bindings: [],
                                        endpoint: {
                                            connector: {
                                                config: encryptedEndpointConfig,
                                                image: `${image_name}${image_tag}`,
                                            },
                                        },
                                    };

                                    Object.keys(resourceConfig).forEach(
                                        (collectionName) => {
                                            draftSpec.bindings.push({
                                                source: collectionName,
                                                resource: {
                                                    ...resourceConfig[
                                                        collectionName
                                                    ].data,
                                                },
                                            });
                                        }
                                    );

                                    supabaseClient
                                        .from(TABLES.DRAFT_SPECS)
                                        .insert([
                                            {
                                                draft_id: newDraftId,
                                                catalog_name: entityName,
                                                spec_type: 'materialization',
                                                spec: draftSpec,
                                            },
                                        ])
                                        .then(
                                            (draftSpecsResponse) => {
                                                setDraftId(newDraftId);
                                                setFormState({
                                                    status: FormStatus.IDLE,
                                                });

                                                if (draftSpecsResponse.error) {
                                                    onFailure({
                                                        error: {
                                                            title: 'materializationCreation.test.failure.errorTitle',
                                                            error: draftSpecsResponse.error,
                                                        },
                                                    });
                                                }
                                            },
                                            () => {
                                                onFailure({
                                                    error: {
                                                        title: 'materializationCreation.test.serverUnreachable',
                                                    },
                                                });
                                            }
                                        );
                                })
                                .catch((error) => {
                                    onFailure({
                                        error: {
                                            title: 'captureCreation.test.failedConfigEncryptTitle',
                                            error,
                                        },
                                    });
                                });
                        } else if (draftsResponse.error) {
                            onFailure({
                                error: {
                                    title: 'materializationCreation.test.failure.errorTitle',
                                    error: draftsResponse.error,
                                },
                            });
                        }
                    },
                    () => {
                        onFailure({
                            error: {
                                title: 'materializationCreation.test.serverUnreachable',
                            },
                        });
                    }
                );
        }
    };

    return (
        <Button
            onClick={test}
            disabled={formInProgress(formStateStatus) || disabled}
            form={formId}
            type="submit"
            sx={buttonSx}
        >
            <FormattedMessage
                id={draftId ? 'foo.ctas.discoverAgain' : 'foo.ctas.discover'}
            />
        </Button>
    );
}

export default Test;
