import type {
    IncompatibleCollectionsGrouping,
    ProcessedIncompatibleCollections,
} from 'src/components/shared/Entity/IncompatibleCollections/types';

import { useMemo } from 'react';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { getEvolutionMessageId, toEvolutionRequest } from 'src/api/evolutions';
import { useBindingsEditorStore_incompatibleCollections } from 'src/components/editor/Bindings/Store/hooks';
import ChipList from 'src/components/shared/ChipList';
import KeyValueList from 'src/components/shared/KeyValueList';

function CollectionsList() {
    const intl = useIntl();

    const incompatibleCollections =
        useBindingsEditorStore_incompatibleCollections();

    const processedIncompatibleCollections = useMemo(() => {
        const response: ProcessedIncompatibleCollections = {
            keyChange: [],
            partitionChange: [],
            authoritativeSourceSchema: [],
            fallThrough: [],
        };

        incompatibleCollections.forEach((incompatibleCollection) => {
            // Generate a request so we know what will change on this collection
            const evolutionRequest = toEvolutionRequest(incompatibleCollection);

            // We need different messaging for when there is a new name vs just resetting
            const helpMessageId = getEvolutionMessageId(evolutionRequest);

            // Fetch the cause so we can tell the user why this is happening
            const recreateCause =
                incompatibleCollection.requires_recreation?.length > 0
                    ? incompatibleCollection.requires_recreation[0]
                    : null;

            response[recreateCause ?? 'fallThrough'].push({
                evolutionRequest,
                helpMessageId,
            });
        });

        return response;
    }, [incompatibleCollections]);

    const newItems = Object.entries(processedIncompatibleCollections)
        .filter(([_key, settings]) => settings && settings.length > 0)
        .map(([key, settings]: [string, IncompatibleCollectionsGrouping[]]) => {
            return {
                val: (
                    <Box
                        sx={{
                            px: 3,
                        }}
                    >
                        <ChipList
                            values={settings.map((setting) => ({
                                title: setting.evolutionRequest.current_name,
                                display: setting.evolutionRequest.current_name,
                            }))}
                        />
                    </Box>
                ),
                title: (
                    <Box
                        sx={{
                            pl: 2,
                            whiteSpace: 'pre',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 500,
                                color: (theme) => theme.palette.text.secondary,
                            }}
                        >
                            {intl.formatMessage({
                                id: `entityEvolution.action.reason.${key}`,
                            })}
                        </Typography>
                        <Tooltip
                            title={intl.formatMessage({
                                id: `entityEvolution.action.${settings[0].helpMessageId}.help`,
                            })}
                        >
                            <IconButton>
                                <HelpCircle />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
            };
        });

    return <KeyValueList data={newItems} disableTypography />;
}

export default CollectionsList;
