import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { Stack, TextField, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import ClearInput from 'components/shared/Input/Clear';
import { useState } from 'react';

interface Props {
    readOnly?: boolean;
}

function CaptureInterval({ readOnly }: Props) {
    const intl = useIntl();
    const captureInterval = useDetailsFormStore(
        (state) => state.details.data.connectorImage.captureInterval
    );

    const [localValue, setLocalValue] = useState<string | null>(null);

    if (!captureInterval) {
        return null;
    }

    return (
        <Stack spacing={1}>
            <Typography variant="formSectionHeader">
                <FormattedMessage id="workflows.interval.header" />
            </Typography>

            <Typography>
                <FormattedMessage id="workflows.interval.description" />
            </Typography>

            <Stack spacing={2} direction="row">
                <TextField
                    disabled={readOnly}
                    label={intl.formatMessage({
                        id: 'workflows.interval.label.input',
                    })}
                    size="small"
                    variant="outlined"
                    value={localValue}
                    InputProps={{
                        endAdornment: (
                            <ClearInput
                                show={Boolean(!readOnly && localValue)}
                                onClear={() => {
                                    console.log('cleared');
                                    setLocalValue(null);
                                }}
                            />
                        ),
                    }}
                    onChange={(event) => {
                        console.log('changed', event.target.value);
                        setLocalValue(event.target.value);
                    }}
                    sx={{
                        'width': '100%',
                        'my': 1,
                        '& .MuiInputBase-root': { borderRadius: 3, my: 0 },
                    }}
                />
            </Stack>
        </Stack>
    );
}

export default CaptureInterval;
