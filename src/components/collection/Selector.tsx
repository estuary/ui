import { Box, Typography } from '@mui/material';
import TreeViewSelector from 'components/collection/TreeViewSelector';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty } from 'lodash';
import pathListToTree from 'path-list-to-tree';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

function CollectionSelector() {
    const { liveSpecs: collectionData, error } = useLiveSpecs('collection');

    const useEntityCreateStore = useRouteStore();
    const setResourceConfig = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.set
    );

    const handlers = {
        updateCollections: (event: React.SyntheticEvent, value: any) => {
            setResourceConfig(value);
        },
    };

    const [catalogNameList, collectionTree] = useMemo(() => {
        const nameList: string[] = [];
        collectionData.forEach((liveSpec) => {
            if (liveSpec.catalog_name) {
                nameList.push(liveSpec.catalog_name);
            }
        });

        return [nameList, pathListToTree(nameList)];
    }, [collectionData]);

    return catalogNameList.length > 0 && !error ? (
        <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
                <FormattedMessage id="materializationCreate.collectionSelector.heading" />
            </Typography>
            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreate.collectionSelector.instructions" />
            </Typography>

            {!isEmpty(collectionTree) ? (
                <Box>
                    <TreeViewSelector
                        items={collectionTree}
                        onChange={handlers.updateCollections}
                    />
                </Box>
            ) : null}
        </Box>
    ) : null;
}

export default CollectionSelector;
