import { Close } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';

interface Props {
    onClear: (emptyValue: string) => void;
    show?: boolean;
}

function ClearInput({ onClear, show }: Props) {
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
                aria-label="Clear input field"
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
