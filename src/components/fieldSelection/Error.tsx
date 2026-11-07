import type { BindingUUIDProp } from 'src/components/fieldSelection/types';

import { Typography } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import { useBindingStore } from 'src/stores/Binding/Store';
import { hasOwnProperty } from 'src/utils/misc-utils';

const FieldValidationError = ({ bindingUUID }: BindingUUIDProp) => {
    const validationFailed = useBindingStore((state) =>
        bindingUUID && hasOwnProperty(state.selections, bindingUUID)
            ? state.selections[bindingUUID].validationFailed
            : false
    );

    if (!validationFailed) {
        return null;
    }

    return (
        <AlertBox severity="error" short>
            <Typography>
                Field selection validation failed. If this issue persists,
                please contact support.
            </Typography>
        </AlertBox>
    );
};

export default FieldValidationError;
