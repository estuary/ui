import { Box, Button, useTheme } from '@mui/material';
import ResourceConfig from 'components/collection/ResourceConfig';
import MessageWithLink from 'components/content/MessageWithLink';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { slate, slateOutline } from 'context/Theme';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import {
    LiveSpecsQuery_spec_general,
    useLiveSpecs_spec_general,
} from 'hooks/useLiveSpecs';
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

type Tab = 'config' | 'schema';

function BindingsEditor({ loading, skeleton, readOnly = false }: Props) {
    const theme = useTheme();
    const jsonTheme =
        theme.palette.mode === 'dark' ? 'bright' : 'bright:inverted';

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();
    const discoveredCollections = useResourceConfig_discoveredCollections();

    const [activeTab, setActiveTab] = useState<Tab>('config');

    const { liveSpecs } = useLiveSpecs_spec_general('collection');
    const { draftSpecs } = useDraftSpecs(persistedDraftId, null, 'collection');

    const collectionData:
        | LiveSpecsQuery_spec_general
        | DraftSpecQuery
        | undefined = useMemo(() => {
        if (currentCollection) {
            return discoveredCollections?.includes(currentCollection)
                ? draftSpecs.find(
                      (query) => query.catalog_name === currentCollection
                  )
                : liveSpecs.find(
                      (query) => query.catalog_name === currentCollection
                  );
        } else {
            return undefined;
        }
    }, [currentCollection, discoveredCollections, draftSpecs, liveSpecs]);

    if (currentCollection) {
        return loading ? (
            <Box>{skeleton}</Box>
        ) : (
            <Box sx={{ p: 1 }}>
                <Button
                    variant="text"
                    onClick={() => setActiveTab('config')}
                    sx={{
                        px: 3,
                        backgroundColor:
                            activeTab === 'config' ? slate[200] : 'transparent',
                        border: slateOutline,
                        borderRadius: 0,
                        color: 'text.primary',
                    }}
                >
                    <FormattedMessage id="workflows.collectionSelector.tab.resourceConfig" />
                </Button>

                <Button
                    variant="text"
                    onClick={() => setActiveTab('schema')}
                    sx={{
                        px: 3,
                        backgroundColor:
                            activeTab === 'schema' ? slate[200] : 'transparent',
                        border: slateOutline,
                        borderRadius: 0,
                        color: 'text.primary',
                    }}
                >
                    <FormattedMessage id="workflows.collectionSelector.tab.collectionSchema" />
                </Button>

                <Box sx={{ border: slateOutline }}>
                    {activeTab === 'config' ? (
                        <ResourceConfig
                            collectionName={currentCollection}
                            readOnly={readOnly}
                        />
                    ) : collectionData ? (
                        <Box
                            sx={{
                                'p': 1,
                                '& .react-json-view': {
                                    backgroundColor: 'transparent !important',
                                },
                            }}
                        >
                            <ReactJson
                                quotesOnKeys={false}
                                src={collectionData.spec}
                                theme={jsonTheme}
                                displayObjectSize={false}
                                displayDataTypes={false}
                            />
                        </Box>
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
