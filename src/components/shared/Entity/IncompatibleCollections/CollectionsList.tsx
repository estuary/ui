import type { CollectionActionProps } from 'src/components/shared/Entity/IncompatibleCollections/types';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { useBindingsEditorStore_incompatibleCollections } from 'src/components/editor/Bindings/Store/hooks';
import Description from 'src/components/shared/Entity/IncompatibleCollections/Description';
import KeyValueList from 'src/components/shared/KeyValueList';
import { hasLength } from 'src/utils/misc-utils';

function CollectionAction({ incompatibleCollection }: CollectionActionProps) {
    const intl = useIntl();

    const recreateCause = hasLength(incompatibleCollection.requires_recreation)
        ? incompatibleCollection.requires_recreation[0]
        : null;

    // TODO (collection reset) - we'll no longer have a "newName" but still need to show user
    // what collections are getting reset
    const newName =
        recreateCause !== null && recreateCause !== 'authoritativeSourceSchema'
            ? 'TODO____previously_the_v2_name_shown_here'
            : null;

    const helpMessage =
        newName !== null ? 'recreateCollection' : 'recreateBindings';

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
                    affectedMaterializations={
                        incompatibleCollection.affected_materializations
                    }
                    newName={newName}
                    recreateCause={recreateCause}
                />
            </Typography>
            <Tooltip
                title={intl.formatMessage({
                    id: `entityEvolution.action.${helpMessage}.help`,
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
