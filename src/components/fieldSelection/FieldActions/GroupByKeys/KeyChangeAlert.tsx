import type { BindingUUIDProp } from 'src/components/fieldSelection/types';

import { Typography } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import useLiveGroupByKey from 'src/hooks/fieldSelection/useLiveGroupByKey';

const KeyChangeAlert = ({ bindingUUID }: BindingUUIDProp) => {
    const { backfillRequired } = useLiveGroupByKey(bindingUUID);

    if (!backfillRequired) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>
                Editing the group-by key may result in a backfill of this
                binding.
            </Typography>
        </AlertBox>
    );
};

export default KeyChangeAlert;
