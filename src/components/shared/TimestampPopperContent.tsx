import type { DateTime } from 'luxon';
import type { ReactNode } from 'react';

import { Fragment } from 'react';

import { Box, Divider, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SingleLineCode from 'src/components/content/SingleLineCode';
import { LOGS_DATE_FORMAT } from 'src/components/tables/cells/logs/shared';

interface Props {
    dateTime: DateTime;
    showRelative?: boolean;
}

const labelSx = {
    color: 'text.secondary',
    fontWeight: 500,
    textTransform: 'uppercase',
} as const;

interface Row {
    labelId: string;
    getValue: (dt: DateTime) => ReactNode;
}

const rows: Row[] = [
    {
        labelId: 'common.timestamp.local.label',
        getValue: (dt) => dt.toLocal().toFormat(LOGS_DATE_FORMAT),
    },
    {
        labelId: 'common.timestamp.utc.label',
        getValue: (dt) => dt.toUTC().toFormat(LOGS_DATE_FORMAT),
    },
];

function TimestampPopperContent({ dateTime, showRelative }: Props) {
    const intl = useIntl();

    return (
        <Box
            onClick={(e) => e.stopPropagation()}
            component="dl"
            sx={{
                'alignItems': 'baseline',
                'display': 'grid',
                'gap': '2px 12px',
                'gridTemplateColumns': 'auto 1fr',
                'm': 0,
                '& dd': { m: 0 },
            }}
        >
            {rows.map(({ labelId, getValue }) => (
                <Fragment key={labelId}>
                    <Typography component="dt" variant="caption" sx={labelSx}>
                        {intl.formatMessage({ id: labelId })}
                    </Typography>

                    <dd>
                        <SingleLineCode compact value={getValue(dateTime)} />
                    </dd>
                </Fragment>
            ))}
            {showRelative ? (
                <>
                    <Divider sx={{ gridColumn: '1 / -1', my: 0.5 }} />
                    <Typography
                        component="dd"
                        sx={{
                            gridColumn: 2,
                            m: 0,
                            textAlign: 'right',
                        }}
                    >
                        {dateTime.toRelative({ style: 'narrow' })}
                    </Typography>
                </>
            ) : null}
        </Box>
    );
}

export default TimestampPopperContent;
