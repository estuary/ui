import { Refresh, Terminal } from '@mui/icons-material';
import {
    Box,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    IconButton,
    Skeleton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { getDraftSpecsByCatalogName } from 'api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import ResourceConfig from 'components/collection/ResourceConfig';
import MessageWithLink from 'components/content/MessageWithLink';
import InferredSchemaDialog from 'components/editor/Bindings/InferredSchemaDialog';
import DiscoveredSchemaCommands from 'components/editor/Bindings/SchemaEditCommands/DiscoveredSchema';
import ExistingSchemaCommands from 'components/editor/Bindings/SchemaEditCommands/ExistingSchema';
import BindingsTabs, { tabProps } from 'components/editor/Bindings/Tabs';
import { CollectionData } from 'components/editor/Bindings/types';
import { DEFAULT_HEIGHT } from 'components/editor/MonacoEditor';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import ButtonWithPopper from 'components/shared/ButtonWithPopper';
import { isEmpty } from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReactJson from 'react-json-view';
import { useLocalStorage } from 'react-use';
import getInferredSchema from 'services/schema-inference';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';
import { Schema } from 'types';
import {
    getStoredGatewayAuthConfig,
    LocalStorageKeys,
} from 'utils/localStorage-utils';

interface Props {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
}

const evaluateCollectionData = async (
    draftId: string | null,
    catalogName: string
): Promise<CollectionData | null> => {
    let draftSpecResponse = null;

    if (draftId) {
        draftSpecResponse = await getDraftSpecsByCatalogName(
            draftId,
            catalogName,
            'collection'
        );
    }

    if (draftSpecResponse && !isEmpty(draftSpecResponse.data)) {
        return { spec: draftSpecResponse.data[0].spec, belongsToDraft: true };
    } else {
        const liveSpecResponse = await getLiveSpecsByCatalogName(
            catalogName,
            'collection'
        );

        return isEmpty(liveSpecResponse.data)
            ? null
            : { spec: liveSpecResponse.data[0].spec, belongsToDraft: false };
    }
};

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const jsonTheme =
        theme.palette.mode === 'dark' ? 'bright' : 'bright:inverted';

    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const [activeTab, setActiveTab] = useState<number>(0);
    const [collectionData, setCollectionData] = useState<
        CollectionData | null | undefined
    >(null);

    const [schemaUpdated, setSchemaUpdated] = useState<boolean>(true);
    const [schemaUpdateErrored, setSchemaUpdateErrored] =
        useState<boolean>(false);

    const [inferredSchema, setInferredSchema] = useState<
        Schema | null | undefined
    >(null);
    const [openSchemaInferenceDialog, setSchemaInferenceDialogOpen] =
        useState<boolean>(false);

    const [gatewayConfig] = useLocalStorage(
        LocalStorageKeys.GATEWAY,
        getStoredGatewayAuthConfig()
    );

    useEffect(() => {
        if (currentCollection) {
            if (gatewayConfig?.gateway_url) {
                getInferredSchema(gatewayConfig, currentCollection).then(
                    (response) => {
                        setInferredSchema(
                            !isEmpty(response.schema) ? response.schema : null
                        );

                        console.log('success', response);
                    },
                    (error) => {
                        setInferredSchema(
                            error?.code === 404 ? null : undefined
                        );

                        console.log('failure', error);
                    }
                );
            }

            evaluateCollectionData(persistedDraftId, currentCollection).then(
                (response) => setCollectionData(response),
                () => setCollectionData(undefined)
            );
        } else {
            setCollectionData(null);
        }
    }, [
        setCollectionData,
        setInferredSchema,
        currentCollection,
        gatewayConfig?.gateway_url,
        persistedDraftId,
    ]);

    const handlers = {
        updateSchema: () => {
            if (currentCollection && collectionData) {
                setSchemaUpdated(false);

                evaluateCollectionData(
                    persistedDraftId,
                    currentCollection
                ).then(
                    (response) => {
                        if (schemaUpdateErrored) {
                            setSchemaUpdateErrored(false);
                        }

                        setCollectionData(response);

                        setSchemaUpdated(true);
                    },
                    () => {
                        setSchemaUpdateErrored(true);
                        setSchemaUpdated(true);
                    }
                );
            }
        },
        openInferredSchemaDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setSchemaInferenceDialogOpen(true);
        },
    };

    if (currentCollection) {
        return loading ? (
            <Box>{skeleton}</Box>
        ) : (
            <Box sx={{ p: 1 }}>
                <BindingsTabs
                    selectedTab={activeTab}
                    setSelectedTab={setActiveTab}
                />

                <Box sx={{ p: 1 }}>
                    {tabProps[activeTab].value === 'config' ? (
                        <ResourceConfig
                            collectionName={currentCollection}
                            readOnly={readOnly}
                        />
                    ) : collectionData || collectionData === null ? (
                        <Stack
                            spacing={2}
                            sx={{
                                '& .react-json-view': {
                                    backgroundColor: 'transparent !important',
                                },
                            }}
                        >
                            {schemaUpdateErrored ? (
                                <AlertBox severity="warning" short>
                                    <FormattedMessage id="workflows.collectionSelector.alert.message.schemaUpdateError" />
                                </AlertBox>
                            ) : null}

                            {persistedDraftId ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ mr: 1 }}>
                                            <FormattedMessage id="workflows.collectionSelector.header.collectionSchema" />
                                        </Typography>

                                        {schemaUpdated ? (
                                            <IconButton
                                                onClick={handlers.updateSchema}
                                            >
                                                <Refresh />
                                            </IconButton>
                                        ) : (
                                            <CircularProgress
                                                size="1.5rem"
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </Box>

                                    {collectionData ? (
                                        <ButtonWithPopper
                                            messageId="workflows.collectionSelector.cta.schemaEdit"
                                            popper={
                                                collectionData.belongsToDraft ? (
                                                    <DiscoveredSchemaCommands />
                                                ) : (
                                                    <ExistingSchemaCommands />
                                                )
                                            }
                                            startIcon={<Terminal />}
                                        />
                                    ) : (
                                        <Skeleton
                                            variant="rectangular"
                                            width={75}
                                        />
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="h6" sx={{ mr: 1 }}>
                                    <FormattedMessage id="workflows.collectionSelector.header.collectionSchema" />
                                </Typography>
                            )}

                            {collectionData ? (
                                <>
                                    {inferredSchema ? (
                                        <InferredSchemaDialog
                                            catalogName={currentCollection}
                                            collectionData={collectionData}
                                            inferredSchema={inferredSchema}
                                            open={openSchemaInferenceDialog}
                                            setOpen={
                                                setSchemaInferenceDialogOpen
                                            }
                                            setCollectionData={
                                                setCollectionData
                                            }
                                            height={
                                                belowMd ? DEFAULT_HEIGHT : 600
                                            }
                                        />
                                    ) : (
                                        <AlertBox severity="warning" short>
                                            No data
                                        </AlertBox>
                                    )}

                                    <FormControlLabel
                                        disabled={!inferredSchema}
                                        control={<Checkbox />}
                                        label={intl.formatMessage({
                                            id: 'workflows.collectionSelector.cta.schemaInference',
                                        })}
                                        onClick={
                                            handlers.openInferredSchemaDialog
                                        }
                                    />

                                    <ReactJson
                                        quotesOnKeys={false}
                                        src={collectionData.spec}
                                        theme={jsonTheme}
                                        displayObjectSize={false}
                                        displayDataTypes={false}
                                    />
                                </>
                            ) : (
                                <BindingsEditorSchemaSkeleton />
                            )}
                        </Stack>
                    ) : (
                        <AlertBox
                            severity="error"
                            short
                            title={
                                <FormattedMessage id="workflows.collectionSelector.error.title.missingCollectionSchema" />
                            }
                        >
                            <MessageWithLink messageID="error.message" />
                        </AlertBox>
                    )}
                </Box>
            </Box>
        );
    } else {
        return null;
    }
}

export default BindingsEditor;
