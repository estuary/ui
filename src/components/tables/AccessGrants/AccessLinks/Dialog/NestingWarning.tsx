import type { NestingWarningProps } from 'src/components/tables/AccessGrants/AccessLinks/Dialog/types';

import { Collapse, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function NestingWarning({ objectRole, show }: NestingWarningProps) {
    const intl = useIntl();

    return (
        <Collapse in={show}>
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage({
                    id: 'admin.users.prefixInvitation.nesting.title',
                })}
            >
                <Typography>
                    {intl.formatMessage({
                        id: 'admin.users.prefixInvitation.nesting',
                    })}
                    <OutlinedChip
                        component="span"
                        variant="outlined"
                        label={objectRole}
                    />
                </Typography>

                <Typography>
                    {intl.formatMessage({
                        id: 'admin.users.prefixInvitation.nesting.instructions',
                    })}
                </Typography>
            </AlertBox>
        </Collapse>
    );
}

export default NestingWarning;
