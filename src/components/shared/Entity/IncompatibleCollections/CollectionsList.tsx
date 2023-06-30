import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { IncompatibleCollections } from 'api/evolutions';
import { useBindingsEditorStore_incompatibleCollections } from 'components/editor/Bindings/Store/hooks';
import KeyValueList from 'components/shared/KeyValueList';
import { HelpCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import { suggestedName } from 'utils/name-utils';
import Description from './Description';

interface CollectionActionProps {
    incompatibleCollection: IncompatibleCollections;
}

function CollectionAction({ incompatibleCollection }: CollectionActionProps) {
    const recreateCause = hasLength(incompatibleCollection.requires_recreation)
        ? incompatibleCollection.requires_recreation[0]
        : null;
    const newName =
        recreateCause !== null && recreateCause !== 'authoritativeSourceSchema'
            ? suggestedName(incompatibleCollection.collection)
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
                title={
                    <FormattedMessage
                        id={`entityEvolution.action.${helpMessage}.help`}
                    />
                }
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
                <Typography sx={{ fontWeight: 600 }}>
                    {ic.collection}
                </Typography>
            ),
        };
    });
    return <KeyValueList data={items} disableTypography />;
}

export default CollectionsList;
