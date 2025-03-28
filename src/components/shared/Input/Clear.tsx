import { Close } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';

import { useIntl } from 'react-intl';

interface Props {
    onClear: (emptyValue: string) => void;
    show?: boolean;
}

function ClearInput({ onClear, show }: Props) {
    const intl = useIntl();

    return (
        <InputAdornment
            position="end"
            style={{
                display: show ? 'flex' : 'none',
                position: 'absolute',
                right: 0,
            }}
        >
            <IconButton
                aria-label={intl.formatMessage({
                    id: 'jsonForms.clearInput',
                })}
                onClick={() => onClear('')}
                size="large"
            >
                <Close
                    style={{
                        borderRadius: '50%',
                    }}
                />
            </IconButton>
        </InputAdornment>
    );
}

export default ClearInput;
