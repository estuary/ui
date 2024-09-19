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
import LinkWrapper from 'components/shared/LinkWrapper';
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
                <LinkWrapper
                    newWindow
                    ariaLabel={intl.formatMessage(
                        { id: 'entityTable.viewDetails.aria' },
                        { name: draftSpecs[0].catalog_name }
                    )}
                    link={generatePath(
                        {
                            catalog_name: draftSpecs[0].catalog_name,
                        },
                        ENTITY_SETTINGS.capture.routes.details
                    )}
                >
                    {draftSpecs[0].catalog_name}
                </LinkWrapper>
            ),
            count: 1,
        },
        {
            entityType: 'collection',
            cell: <ChipList values={collectionsBeingBackfilled} maxChips={9} />,
            count: collectionsBeingBackfilled.length,
        },
        {
            entityType: 'materialization',
            cell: (
                <LinkWrapper
                    newWindow
                    ariaLabel={intl.formatMessage(
                        { id: 'entityTable.viewDetails.aria' },
                        { name: materializationName }
                    )}
                    link={generatePath(
                        {
                            catalog_name: materializationName,
                        },
                        ENTITY_SETTINGS.materialization.routes.details
                    )}
                >
                    {materializationName}
                </LinkWrapper>
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
                            <TableRow key={`review-table-row-${pluralId}`}>
                                <TableCell
                                    sx={{
                                        minHeight: 45,
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
