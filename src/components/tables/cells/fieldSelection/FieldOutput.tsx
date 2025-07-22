import type { FieldOutputProps } from 'src/components/tables/cells/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import FieldConflictButton from 'src/components/tables/cells/fieldSelection/FieldConflictButton';
import { fieldOutcomeMessages } from 'src/components/tables/cells/fieldSelection/shared';

const FieldOutput = ({
    indicateConflict,
    outcome,
    output,
}: FieldOutputProps) => {
    const intl = useIntl();

    const titleId =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        fieldOutcomeMessages[output?.reason]?.id ??
        'fieldSelection.table.label.unknown';

    return (
        <>
            <Stack direction="row" style={{ alignItems: 'center' }}>
                <Typography
                    sx={{
                        color: indicateConflict
                            ? (theme) =>
                                  theme.palette.mode === 'light'
                                      ? theme.palette.warning.dark
                                      : theme.palette.warning.main
                            : undefined,
                        fontWeight: 500,
                        marginRight: '4px',
                    }}
                >
                    {intl.formatMessage({ id: titleId })}
                </Typography>

                {indicateConflict && outcome ? (
                    <FieldConflictButton outcome={outcome} />
                ) : null}
            </Stack>

            <Typography>
                {output.detail.charAt(0).toUpperCase() + output.detail.slice(1)}
            </Typography>
        </>
    );
};

export default FieldOutput;
