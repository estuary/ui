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
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { BindingsEditorSchemaSkeleton } from 'components/collection/CollectionSkeletons';
import ResourceConfig from 'components/collection/ResourceConfig';
import MessageWithLink from 'components/content/MessageWithLink';
import SchemaEditButton from 'components/editor/Bindings/SchemaEdit/Button';
import SchemaInferenceButton from 'components/editor/Bindings/SchemaInference/Button';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_setCollectionData,
} from 'components/editor/Bindings/Store/hooks';
import BindingsTabs, { tabProps } from 'components/editor/Bindings/Tabs';
import { CollectionData } from 'components/editor/Bindings/types';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { isEmpty } from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactJson from 'react-json-view';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

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
    const theme = useTheme();
    const jsonTheme =
        theme.palette.mode === 'dark' ? 'bright' : 'bright:inverted';

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();
    const setCollectionData = useBindingsEditorStore_setCollectionData();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const [activeTab, setActiveTab] = useState<number>(0);

    const [schemaUpdated, setSchemaUpdated] = useState<boolean>(true);
    const [schemaUpdateErrored, setSchemaUpdateErrored] =
        useState<boolean>(false);

    useEffect(() => {
        if (currentCollection) {
            evaluateCollectionData(persistedDraftId, currentCollection).then(
                (response) => setCollectionData(response),
                () => setCollectionData(undefined)
            );
        } else {
            setCollectionData(null);
        }
    }, [setCollectionData, currentCollection, persistedDraftId]);

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

                                    <Stack direction="row" spacing={1}>
                                        <SchemaInferenceButton />

                                        <SchemaEditButton />
                                    </Stack>
                                </Box>
                            ) : (
                                <Typography variant="h6" sx={{ mr: 1 }}>
                                    <FormattedMessage id="workflows.collectionSelector.header.collectionSchema" />
                                </Typography>
                            )}

                            {collectionData ? (
                                <ReactJson
                                    quotesOnKeys={false}
                                    src={collectionData.spec}
                                    theme={jsonTheme}
                                    displayObjectSize={false}
                                    displayDataTypes={false}
                                />
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
