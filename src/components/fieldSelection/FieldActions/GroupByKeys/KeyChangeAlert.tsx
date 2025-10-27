import type { KeyChangeAlertProps } from 'src/components/fieldSelection/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import useLiveGroupByKey from 'src/hooks/fieldSelection/useLiveGroupByKey';

const KeyChangeAlert = ({ bindingUUID }: KeyChangeAlertProps) => {
    const intl = useIntl();

    const { backfillRequired } = useLiveGroupByKey(bindingUUID);

    if (!backfillRequired) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>
                {intl.formatMessage({
                    id: 'fieldSelection.groupBy.alert.backfillRequired',
                })}
            </Typography>
        </AlertBox>
    );
};

export default KeyChangeAlert;
