import { Button, SxProps, Theme } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { encryptConfig } from 'api/sops';
import { EditorStoreState } from 'components/editor/Store';
import useConnectorTags from 'hooks/useConnectorTags';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
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

function MaterializeTestButton({ disabled, formId, onFailure }: Props) {
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

            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return onFailure({
                    error: {
                        title: 'materializationCreation.test.failure.errorTitle',
                        error: draftsResponse.error,
                    },
                });
            }

            const encryptedEndpointConfig = await encryptConfig(
                endpointSchema,
                endpointConfig
            );
            if (encryptedEndpointConfig.error) {
                return onFailure({
                    error: {
                        title: 'captureCreation.test.failedConfigEncryptTitle',
                        error: encryptedEndpointConfig.error,
                    },
                });
            }

            const newDraftId = draftsResponse.data[0].id;

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

            Object.keys(resourceConfig).forEach((collectionName) => {
                draftSpec.bindings.push({
                    source: collectionName,
                    resource: {
                        ...resourceConfig[collectionName].data,
                    },
                });
            });

            const draftSpecsResponse = await createDraftSpec(
                newDraftId,
                entityName,
                'materialization',
                draftSpec
            );
            if (draftSpecsResponse.error) {
                return onFailure({
                    error: {
                        title: 'materializationCreation.test.failure.errorTitle',
                        error: draftSpecsResponse.error,
                    },
                });
            }

            setDraftId(newDraftId);
            setFormState({
                status: FormStatus.IDLE,
            });
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

export default MaterializeTestButton;
