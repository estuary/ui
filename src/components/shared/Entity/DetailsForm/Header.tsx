import { Typography, useTheme } from '@mui/material';

import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';

interface Props {
    messagePrefix: string;
}

function DetailsFormHeader({ messagePrefix }: Props) {
    const theme = useTheme();

    const detailsFormHasErrors = useDetailsFormStore(
        (state) => state.errorsExist
    );

    return (
        <>
            {detailsFormHasErrors ? (
                <WarningCircle
                    style={{
                        marginRight: 8,
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
