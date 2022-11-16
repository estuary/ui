import { Refresh } from '@mui/icons-material';
import {
    Box,
    CircularProgress,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { getDraftSpecsByCatalogName } from 'api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'api/liveSpecs';
import ResourceConfig from 'components/collection/ResourceConfig';
import MessageWithLink from 'components/content/MessageWithLink';
import MessageWithPopper from 'components/content/MessageWithPopper';
import SchemaEditCommands from 'components/editor/Bindings/SchemaEditCommands';
import BindingsTabs from 'components/editor/Bindings/Tabs';
import { tabProps } from 'components/editor/Bindings/types';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useLiveSpecs_spec_general } from 'hooks/useLiveSpecs';
import { ReactNode, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactJson from 'react-json-view';
import {
    useResourceConfig_currentCollection,
    useResourceConfig_discoveredCollections,
} from 'stores/ResourceConfig/hooks';

interface Props {
    loading: boolean;
    skeleton: ReactNode;
    readOnly?: boolean;
}

interface CollectionData {
    spec: any;
    belongsToDraft: boolean;
}

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const theme = useTheme();
    const jsonTheme =
        theme.palette.mode === 'dark' ? 'bright' : 'bright:inverted';

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();
    const discoveredCollections = useResourceConfig_discoveredCollections();

    const [activeTab, setActiveTab] = useState<number>(0);
    const [schemaUpdated, setSchemaUpdated] = useState<boolean>(true);

    const { liveSpecs } = useLiveSpecs_spec_general('collection');
    const { draftSpecs } = useDraftSpecs(persistedDraftId, null, 'collection');

    const collectionData: CollectionData | null = useMemo(() => {
        if (currentCollection) {
            const belongsToDraft: boolean =
                discoveredCollections?.includes(currentCollection) ?? false;

            const queryData = belongsToDraft
                ? draftSpecs.find(
                      (query) => query.catalog_name === currentCollection
                  )
                : liveSpecs.find(
                      (query) => query.catalog_name === currentCollection
                  );

            return queryData ? { spec: queryData.spec, belongsToDraft } : null;
        } else {
            return null;
        }
    }, [currentCollection, discoveredCollections, draftSpecs, liveSpecs]);

    const handlers = {
        updateSchema: () => {
            if (currentCollection && collectionData) {
                setSchemaUpdated(false);

                if (collectionData.belongsToDraft && persistedDraftId) {
                    getDraftSpecsByCatalogName(
                        persistedDraftId,
                        currentCollection,
                        'collection'
                    ).then(
                        (response) => {
                            if (response.data) {
                                collectionData.spec = response.data[0].spec;
                            }

                            setSchemaUpdated(true);
                        },
                        () => {
                            setSchemaUpdated(true);
                        }
                    );
                } else {
                    getLiveSpecsByCatalogName(
                        currentCollection,
                        'collection'
                    ).then(
                        (response) => {
                            if (response.data) {
                                collectionData.spec = response.data[0].spec;
                            }

                            setSchemaUpdated(true);
                        },
                        () => {
                            setSchemaUpdated(true);
                        }
                    );
                }
            }
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

                <Box>
                    {tabProps[activeTab].value === 'config' ? (
                        <ResourceConfig
                            collectionName={currentCollection}
                            readOnly={readOnly}
                        />
                    ) : collectionData ? (
                        <Stack
                            spacing={2}
                            sx={{
                                'p': 1,
                                '& .react-json-view': {
                                    backgroundColor: 'transparent !important',
                                },
                            }}
                        >
                            <AlertBox severity="info" short>
                                <MessageWithPopper
                                    messageId="workflows.collectionSelector.alert.message.schemaEdit"
                                    popper={<SchemaEditCommands />}
                                />
                            </AlertBox>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ mr: 1 }}>
                                    <FormattedMessage id="workflows.collectionSelector.header.collectionSchema" />
                                </Typography>

                                {schemaUpdated ? (
                                    <IconButton onClick={handlers.updateSchema}>
                                        <Refresh />
                                    </IconButton>
                                ) : (
                                    <CircularProgress
                                        size="1.5rem"
                                        sx={{ ml: 1 }}
                                    />
                                )}
                            </Box>

                            <ReactJson
                                quotesOnKeys={false}
                                src={collectionData.spec}
                                theme={jsonTheme}
                                displayObjectSize={false}
                                displayDataTypes={false}
                            />
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
