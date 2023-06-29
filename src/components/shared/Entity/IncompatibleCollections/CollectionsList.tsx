import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { IncompatibleCollections } from 'api/evolutions';
import { useBindingsEditorStore_incompatibleCollections } from 'components/editor/Bindings/Store/hooks';
import KeyValueList from 'components/shared/KeyValueList';
import { HelpCircle } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import { suggestedName } from 'utils/name-utils';

interface CollectionActionProps {
    incompatibleCollection: IncompatibleCollections;
}

function CollectionAction({ incompatibleCollection }: CollectionActionProps) {
    const intl = useIntl();
    const recreateCause = hasLength(incompatibleCollection.requires_recreation)
        ? incompatibleCollection.requires_recreation[0]
        : null;
    const newName =
        recreateCause !== null && recreateCause !== 'authoritativeSourceSchema'
            ? suggestedName(incompatibleCollection.collection)
            : null;

    let desc = null;
    if (newName !== null) {
        const reason = intl.formatMessage({
            id: `entityEvolution.action.recreateCollection.reason.${recreateCause}`,
        });
        desc = (
            <FormattedMessage
                id="entityEvolution.action.recreateCollection.description"
                values={{ newName, reason }}
            />
        );
    } else if (incompatibleCollection.affected_materializations?.length === 1) {
        // We _could_ also provide a reason as part of these. We're not doing so now because the `reason` that's attached to the fields on the AffectedConsumer
        // are way too verbose. We'd need to update connectors to provide much more concise reasons before we present them here. Once/if we do that, then we
        // should be able to format a message using the fields and reasons for each one.
        desc = (
            <FormattedMessage
                id="entityEvolution.action.recreateOneBinding.description"
                values={{
                    materializationName:
                        incompatibleCollection.affected_materializations[0]
                            .name,
                }}
            />
        );
    } else {
        desc = (
            <FormattedMessage
                id="entityEvolution.action.recreateBindings.description"
                values={{
                    materializationCount:
                        incompatibleCollection.affected_materializations
                            ?.length,
                }}
            />
        );
    }
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
            <Typography color="text.primary">{desc}</Typography>
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
