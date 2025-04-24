import { useMemo } from 'react';

import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import RelatedEntities from 'src/components/shared/Entity/Details/RelatedEntities';
import EntityNameDetailsLink from 'src/components/shared/Entity/EntityNameDetailsLink';
import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useEntityType } from 'src/context/EntityContext';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { useBinding_collectionsBeingBackfilled } from 'src/stores/Binding/hooks';

function ReviewTable() {
    const intl = useIntl();

    const parentEntityType = useEntityType();

    const { generatePath } = useDetailsNavigator('');

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();
    const [materializationName] = usePreSavePromptStore((state) => [
        state.context.backfillTarget?.catalog_name,
    ]);

    const tableRows = useMemo(() => {
        const response = [
            {
                entityType: parentEntityType,
                cell: (
                    <EntityNameDetailsLink
                        newWindow
                        name={draftSpecs[0].catalog_name}
                        path={generatePath(
                            {
                                catalog_name: draftSpecs[0].catalog_name,
                            },
                            ENTITY_SETTINGS.capture.routes.details
                        )}
                    />
                ),
                count: 1,
            },
        ];

        if (collectionsBeingBackfilled.length > 0) {
            response.push({
                entityType: 'collection',
                cell: (
                    <RelatedEntities
                        collectionId={null}
                        entityType="collection"
                        newWindow
                        preferredList={collectionsBeingBackfilled}
                    />
                ),
                count: collectionsBeingBackfilled.length,
            });
        }

        // Only captures allow data flow reset right now
        if (parentEntityType === 'capture' && materializationName) {
            response.push({
                entityType: 'materialization',
                cell: (
                    <EntityNameDetailsLink
                        newWindow
                        name={materializationName}
                        path={generatePath(
                            {
                                catalog_name: materializationName,
                            },
                            ENTITY_SETTINGS.materialization.routes.details
                        )}
                    />
                ),
                count: 1,
            });
        }

        return response;
    }, [
        collectionsBeingBackfilled,
        draftSpecs,
        parentEntityType,
        generatePath,
        materializationName,
    ]);

    return (
        <TableContainer>
            <Table size="small" sx={{ border: 'red' }}>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableRows.map(({ cell, count, entityType }) => {
                        const { pluralId, Icon } = ENTITY_SETTINGS[entityType];

                        return (
                            <TableRow
                                key={`review-table-row-${pluralId}`}
                                sx={{ height: 50 }}
                            >
                                <TableCell
                                    sx={{
                                        minWidth: 'fit-content',
                                        width: 0,
                                        background: (theme) =>
                                            theme.palette.background.default,
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        style={{
                                            alignItems: 'center',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        <Icon style={{ fontSize: 12 }} />

                                        <Box>
                                            {intl.formatMessage(
                                                { id: pluralId },
                                                { count }
                                            )}
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>{cell}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ReviewTable;
