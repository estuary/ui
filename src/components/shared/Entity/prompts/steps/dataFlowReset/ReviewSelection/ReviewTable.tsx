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
import ChipList from 'components/shared/ChipList';
import { useIntl } from 'react-intl';
import { useBinding_collectionsBeingBackfilled } from 'stores/Binding/hooks';
import { ENTITY_SETTINGS } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function ReviewTable() {
    const intl = useIntl();

    const [materializationName] = usePreSavePromptStore((state) => [
        state.context?.backfillTarget?.catalog_name,
    ]);
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();

    const tableRows = [
        {
            entityType: 'capture',
            cell: draftSpecs[0].catalog_name,
            count: 1,
        },
        {
            entityType: 'collection',
            cell: <ChipList values={collectionsBeingBackfilled} maxChips={9} />,
            count: collectionsBeingBackfilled.length,
        },
        {
            entityType: 'materialization',
            cell: materializationName,
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
                            <TableRow key={`review-table-row-${pluralId}`}>
                                <TableCell
                                    sx={{
                                        minHeight: 45,
                                        minWidth: 'fit-content',
                                        maxWidth: 'fit-content',
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
