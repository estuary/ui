import { Stack } from '@mui/material';
import { useIntl } from 'react-intl';
import type { GrantWhatIsChangingProps } from './types';

function GrantWhatIsChanging({
    identifier,
    capability,
    grantScope,
}: GrantWhatIsChangingProps) {
    const intl = useIntl();

    return (
        <Stack
            useFlexGap
            direction="row"
            spacing={0.5}
            sx={{
                'flexWrap': 'wrap',
                'lineBreak': 'anywhere',
                '& span:nth-of-type(odd)': {
                    fontWeight: 500,
                },
            }}
        >
            <span>{identifier}</span>
            <span>
                {intl.formatMessage({
                    id: 'accessGrants.actions.extra.confirmation.whatIsChanging.removing',
                })}
            </span>
            <span>{capability}</span>
            <span>
                {intl.formatMessage({
                    id: 'accessGrants.actions.extra.confirmation.whatIsChanging.access',
                })}
            </span>
            <span>{grantScope}</span>
        </Stack>
    );
}

export default GrantWhatIsChanging;
