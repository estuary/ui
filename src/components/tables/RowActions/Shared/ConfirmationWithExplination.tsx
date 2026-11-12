import type { AccessGrantRowConfirmation } from 'src/components/tables/RowActions/AccessGrants/types';
import type { ConfirmationWithExplanationProps } from 'src/components/tables/RowActions/Shared/types';
import type { AccessGrantRemovalSeverity } from 'src/hooks/useAccessGrantRemovalDescriptions';

import { useMemo } from 'react';

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

import { WarningTriangle } from 'iconoir-react';

import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';
import { alertColorsReversed } from 'src/context/Theme';

function ConfirmationWithExplanation({
    message,
    selected,
}: ConfirmationWithExplanationProps) {
    const theme = useTheme();

    const { dangerous: potentiallyDangerousUpdates, normal: normalUpdates } =
        useMemo(() => {
            const response: {
                [k in AccessGrantRemovalSeverity]: AccessGrantRowConfirmation[];
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
                        pr: 0,
                        textAlign: 'right',
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
                    headerMessage="Extra Attention Required"
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
                        <TableCell style={{ width: '50%' }}>
                            What is changing?
                        </TableCell>
                        <TableCell />
                        <TableCell style={{ width: '50%' }}>
                            What will happen?
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

export default ConfirmationWithExplanation;
