import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { alertColorsReversed } from 'context/Theme';
import { AccessGrantRemovalType } from 'hooks/useAccessGrantRemovalDescriptions';
import { WarningTriangle } from 'iconoir-react';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { AccessGrantRowConfirmation } from '../AccessGrants/types';
import { ConfirmationWithExplinationProps } from './types';

const leftSideWidth = '50%';
const rightSideWidth = '50%';

function ConfirmationWithExplination({
    message,
    selected,
}: ConfirmationWithExplinationProps) {
    const intl = useIntl();
    const theme = useTheme();

    const { dangerous: potentiallyDangerousUpdates, normal: normalUpdates } =
        useMemo(() => {
            const response: {
                [k in AccessGrantRemovalType]: AccessGrantRowConfirmation[];
            } = {
                dangerous: [],
                normal: [],
            };

            selected.forEach((datum) => {
                response[datum.details[0]].push(datum);
            });

            return response;
        }, [selected]);

    const renderTableRowContent = (item: AccessGrantRowConfirmation) => {
        const dangerous = item.details[0] === 'dangerous';

        const color = dangerous
            ? alertColorsReversed.warning[theme.palette.mode]
            : undefined;
        const fontWeight = dangerous ? 500 : undefined;

        return (
            <>
                <TableCell>{item.message}</TableCell>

                <TableCell
                    sx={{
                        color,
                        fontWeight,
                    }}
                >
                    {dangerous ? <WarningTriangle /> : null}
                </TableCell>

                <TableCell
                    sx={{
                        color,
                        fontWeight,
                    }}
                >
                    {item.details[1]}
                </TableCell>
            </>
        );
    };

    return (
        <Box>
            {potentiallyDangerousUpdates.length > 0 ? (
                <AlertBox
                    short={false}
                    sx={{
                        my: 1,
                        p: 3,
                    }}
                    headerMessage={intl.formatMessage({
                        id: 'accessGrants.actions.extra.confirmation.title',
                    })}
                    severity="warning"
                >
                    <Typography component="div">
                        <MessageWithLink messageID="accessGrants.actions.extra.confirmation.instructions" />
                    </Typography>
                </AlertBox>
            ) : (
                message
            )}

            <Table size="small" sx={{ ml: 2 }}>
                <TableHead>
                    <TableRow style={{ width: '100%' }}>
                        <TableCell style={{ width: leftSideWidth }}>
                            {intl.formatMessage({
                                id: 'accessGrants.actions.extra.confirmation.whatIsChanging',
                            })}
                        </TableCell>
                        <TableCell />
                        <TableCell style={{ width: rightSideWidth }}>
                            {intl.formatMessage({
                                id: 'accessGrants.actions.extra.confirmation.whatThatMeans',
                            })}
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {normalUpdates.map((item, index) => {
                        return (
                            <TableRow
                                key={`confirmation-normal-items-${item.id}-${index}`}
                            >
                                {renderTableRowContent(item)}
                            </TableRow>
                        );
                    })}

                    {potentiallyDangerousUpdates.map((item, index) => {
                        return (
                            <TableRow
                                key={`confirmation-warning-items-${item.id}-${index}`}
                            >
                                {renderTableRowContent(item)}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
}

export default ConfirmationWithExplination;
