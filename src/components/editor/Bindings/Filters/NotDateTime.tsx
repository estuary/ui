import {
    FormControl,
    FormHelperText,
    Input,
    InputLabel,
    Stack,
} from '@mui/material';
import DateTimePickerCTA from 'components/shared/pickers/DateTimePickerCTA';
import useDatePickerState from 'components/shared/pickers/useDatePickerState';
import { useState } from 'react';

interface Props {
    collectionName: string;
    description: string;
    label: string;
    period: 'before' | 'after';
}

function NotDateTime({ collectionName, description, label, period }: Props) {
    const idValue = `not-${period}-picker__${collectionName}`;
    const { state, buttonRef, events } = useDatePickerState(idValue);

    const [localValue, setLocalValue] = useState<string>('');

    const onFocusHandler = () => {
        events.focus();
    };

    // const dateTimePickerValue = localValue
    // ? localValue.replace(TIMEZONE_OFFSET_REPLACEMENT, '')
    // : null;

    return (
        <Stack
            sx={{
                alignItems: 'center',
                width: '100%',
            }}
            direction="row"
        >
            <FormControl
                fullWidth
                variant="standard"
                onFocus={onFocusHandler}
                onKeyDown={events.keyDown}
            >
                <InputLabel htmlFor={`${idValue}__input`} required={false}>
                    {label}
                </InputLabel>

                <Input
                    id={`${idValue}__input`}
                    value={localValue}
                    onChange={(event) => {
                        setLocalValue(event.target.value);
                    }}
                    onKeyDown={events.keyDown}
                />
                <FormHelperText>{description}</FormHelperText>
            </FormControl>

            <DateTimePickerCTA
                enabled={true}
                label={label}
                buttonRef={buttonRef}
                state={state}
                value={localValue}
                onChange={(value) => {
                    console.log('picker changed', value);
                    setLocalValue(value);
                }}
            />
        </Stack>
    );
}

export default NotDateTime;
