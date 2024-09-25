import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import EntityNameDetailsLink from 'components/shared/Entity/EntityNameDetailsLink';
import RelatedCollections from 'components/shared/Entity/RelatedCollections';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { useIntl } from 'react-intl';
import { useBinding_collectionsBeingBackfilled } from 'stores/Binding/hooks';
import { ENTITY_SETTINGS } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function ReviewTable() {
    const intl = useIntl();

    const { generatePath } = useDetailsNavigator('');

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();
    const [materializationName] = usePreSavePromptStore((state) => [
        state.context?.backfillTarget?.catalog_name,
    ]);

    const tableRows = [
        {
            entityType: 'capture',
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
        {
            entityType: 'collection',
            cell: (
                <RelatedCollections
                    collections={collectionsBeingBackfilled}
                    newWindow
                />
            ),
            count: collectionsBeingBackfilled.length,
        },
        {
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
        },
    ];

    return (
        <TableContainer>
            <Table size="small">
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
