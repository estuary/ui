import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { Typography, useTheme } from '@mui/material';

import { useDetailsForm_errorsExist } from 'stores/DetailsForm/hooks';

interface Props {
    messagePrefix: string;
}

function DetailsFormHeader({ messagePrefix }: Props) {
    const theme = useTheme();

    const detailsFormHasErrors = useDetailsForm_errorsExist();

    return (
        <>
            {detailsFormHasErrors ? (
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            ) : null}

            <Typography variant="subtitle1">
                <FormattedMessage id={`${messagePrefix}.details.heading`} />
            </Typography>
        </>
    );
}

export default DetailsFormHeader;
