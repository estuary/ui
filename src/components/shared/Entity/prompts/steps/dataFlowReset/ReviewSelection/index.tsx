import {
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import ChipList from 'components/shared/ChipList';
import { useIntl } from 'react-intl';
import { useBinding_collectionsBeingBackfilled } from 'stores/Binding/hooks';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function ReviewSelection() {
    const intl = useIntl();

    const [materializationName] = usePreSavePromptStore((state) => [
        state.context?.backfillTarget?.catalog_name,
    ]);
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();

    return (
        <Stack spacing={2}>
            <AlertBox
                short
                severity="warning"
                title={intl.formatMessage({
                    id: 'dataFlowReset.warning.title',
                })}
            >
                {intl.formatMessage({ id: 'dataFlowReset.warning.message' })}
            </AlertBox>

            <Typography>
                Please review the selections you have made and ensure everything
                looks correct. If not please click "back" and change them before
                continuing.
            </Typography>

            <TableContainer>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell
                                sx={{
                                    background: (theme) =>
                                        theme.palette.background.default,
                                }}
                            >
                                {intl.formatMessage({ id: 'terms.capture' })}
                            </TableCell>
                            <TableCell>{draftSpecs[0].catalog_name}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell
                                sx={{
                                    background: (theme) =>
                                        theme.palette.background.default,
                                }}
                            >
                                {intl.formatMessage({
                                    id: 'terms.collections',
                                })}
                            </TableCell>
                            <TableCell>
                                <ChipList
                                    values={collectionsBeingBackfilled}
                                    maxChips={9}
                                />
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell
                                sx={{
                                    background: (theme) =>
                                        theme.palette.background.default,
                                }}
                            >
                                {intl.formatMessage({
                                    id: 'terms.materialization',
                                })}
                            </TableCell>
                            <TableCell>{materializationName}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/*<TableContainer>
                <TableHead>
                    <TableRow
                        sx={{
                            background: (theme) =>
                                theme.palette.background.default,
                        }}
                    >
                        <TableCell>
                            {intl.formatMessage({ id: 'terms.capture' })}
                        </TableCell>

                        <TableCell>
                            {intl.formatMessage({ id: 'terms.collections' })}
                        </TableCell>

                        <TableCell>
                            {intl.formatMessage({
                                id: 'terms.materialization',
                            })}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{draftSpecs[0].catalog_name}</TableCell>
                        <TableCell>
                            <ChipList values={collectionsBeingBackfilled} />
                        </TableCell>
                        <TableCell>{materializationName}</TableCell>
                    </TableRow>
                </TableBody>
            </TableContainer>*/}
        </Stack>
    );
}

export default ReviewSelection;
