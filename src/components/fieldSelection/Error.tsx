import type { BindingUUIDProp } from 'src/components/fieldSelection/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useBindingStore } from 'src/stores/Binding/Store';
import { hasOwnProperty } from 'src/utils/misc-utils';

const FieldValidationError = ({ bindingUUID }: BindingUUIDProp) => {
    const intl = useIntl();

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
                {intl.formatMessage({
                    id: 'fieldSelection.error.validationFailed',
                })}
            </Typography>
        </AlertBox>
    );
};

export default FieldValidationError;
