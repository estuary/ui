import type { CollectionActionProps } from 'src/components/shared/Entity/IncompatibleCollections/types';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { getEvolutionMessageId, toEvolutionRequest } from 'src/api/evolutions';
import { useBindingsEditorStore_incompatibleCollections } from 'src/components/editor/Bindings/Store/hooks';
import Description from 'src/components/shared/Entity/IncompatibleCollections/Description';
import KeyValueList from 'src/components/shared/KeyValueList';

function CollectionAction({ incompatibleCollection }: CollectionActionProps) {
    const intl = useIntl();

    // Generate a request so we know what will change on this collection
    const evolutionRequest = toEvolutionRequest(incompatibleCollection);

    // We need different messaging for when there is a new name vs just resetting
    const helpMessageId = getEvolutionMessageId(evolutionRequest);

    // Fetch the cause so we can tell the user why this is happening
    const recreateCause =
        incompatibleCollection.requires_recreation?.length > 0
            ? incompatibleCollection.requires_recreation[0]
            : null;

    return (
        <Box
            sx={{
                pl: 2,
                whiteSpace: 'pre',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Typography color="text.primary">
                <Description
                    evolutionRequest={evolutionRequest}
                    helpMessageId={helpMessageId}
                    recreateCause={recreateCause}
                />
            </Typography>
            <Tooltip
                title={intl.formatMessage({
                    id: `entityEvolution.action.${helpMessageId}.help`,
                })}
            >
                <IconButton>
                    <HelpCircle />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

function CollectionsList() {
    const incompatibleCollections =
        useBindingsEditorStore_incompatibleCollections();

    const items = incompatibleCollections.map((ic) => {
        return {
            val: <CollectionAction incompatibleCollection={ic} />,
            title: (
                <Typography
                    sx={{
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.secondary,
                    }}
                >
                    {ic.collection}
                </Typography>
            ),
        };
    });
    return <KeyValueList data={items} disableTypography />;
}

export default CollectionsList;
