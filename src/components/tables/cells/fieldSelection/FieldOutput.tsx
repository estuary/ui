import type { FieldOutputProps } from 'src/components/tables/cells/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { fieldOutcomeMessages } from 'src/components/tables/cells/fieldSelection/shared';

const FieldOutput = ({ indicateConflict, output }: FieldOutputProps) => {
    const intl = useIntl();

    const titleId =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        fieldOutcomeMessages[output?.reason?.type]?.id ??
        'fieldSelection.table.label.unknown';

    return (
        <>
            <Typography
                sx={{
                    color: indicateConflict
                        ? (theme) =>
                              theme.palette.mode === 'light'
                                  ? theme.palette.error.dark
                                  : theme.palette.error.main
                        : undefined,
                    fontWeight: 500,
                    marginRight: '4px',
                }}
            >
                {intl.formatMessage({ id: titleId })}
            </Typography>

            <Typography>
                {output.detail.charAt(0).toUpperCase() + output.detail.slice(1)}
            </Typography>
        </>
    );
};

export default FieldOutput;
