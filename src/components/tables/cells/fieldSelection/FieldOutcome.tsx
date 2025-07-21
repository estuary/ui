import type { FieldOutcomeProps } from 'src/components/tables/cells/types';

import { TableCell, Typography } from '@mui/material';

const FieldOutcome = ({ outcome, selectionType }: FieldOutcomeProps) => {
    const singleOutcome = outcome?.select ? outcome.select : outcome?.reject;

    if ((!outcome?.select && !outcome?.reject) || !singleOutcome) {
        return <TableCell />;
    }

    // if (outcome?.select && outcome?.reject) {
    //     return (
    //         <TableCell
    //             sx={{
    //                 minWidth: 275,
    //                 color: (theme) =>
    //                     theme.palette.mode === 'light'
    //                         ? theme.palette.warning.dark
    //                         : theme.palette.warning.main,
    //             }}
    //         >
    //             <Typography sx={{ fontWeight: 500 }}>
    //                 {singleOutcome.reason.replace(/([A-Z])/g, ' $1').trim()}
    //             </Typography>

    //             <Typography>
    //                 {singleOutcome.detail.charAt(0).toUpperCase() +
    //                     singleOutcome.detail.slice(1)}
    //             </Typography>
    //         </TableCell>
    //     );
    // }

    const output =
        outcome?.select && outcome?.reject && selectionType === 'exclude'
            ? outcome.reject
            : outcome?.select && outcome?.reject
              ? outcome.select
              : singleOutcome;

    return (
        <TableCell
            sx={{
                minWidth: 275,
            }}
        >
            <Typography
                sx={{
                    color:
                        outcome?.select && outcome?.reject
                            ? (theme) =>
                                  theme.palette.mode === 'light'
                                      ? theme.palette.warning.dark
                                      : theme.palette.warning.main
                            : undefined,
                    fontWeight: 500,
                }}
            >
                {output.reason.replace(/([A-Z])/g, ' $1').trim()}
            </Typography>

            <Typography>
                {output.detail.charAt(0).toUpperCase() + output.detail.slice(1)}
            </Typography>
        </TableCell>
    );
};

export default FieldOutcome;
