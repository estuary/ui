import type { BaseConfirmationProps } from 'src/components/tables/RowActions/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';

function DeleteConfirmation({ count }: BaseConfirmationProps) {
    const intl = useIntl();

    return (
        <AlertBox severity="warning" short>
            <Typography component="div">
                {intl.formatMessage(
                    { id: 'entityTable.delete.confirm' },
                    { count }
                )}
            </Typography>
        </AlertBox>
    );
}

export default DeleteConfirmation;
