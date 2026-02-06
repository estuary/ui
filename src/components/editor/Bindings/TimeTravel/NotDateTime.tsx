import { useState } from 'react';

import {
    FormControl,
    FormHelperText,
    Input,
    InputLabel,
    Stack,
} from '@mui/material';

import DateTimePickerCTA from 'src/components/shared/pickers/DateTimePickerCTA';
import { validateDateTime } from 'src/components/shared/pickers/shared';
import useDatePickerState from 'src/components/shared/pickers/useDatePickerState';

interface Props {
    collectionName: string;
    description: string;
    label: string;
    setting: any; //FilterProperties;
}

// TODO (time travel)
// So I started making this able to be done outside of JSON Forms in case we wanted super custom styling
//      however, we are not currently (Q4 2023) going after that. Also, this became a huge pain when it came time to
//      validate the inputs as that is basically just duplicating what JSONForms helps us with already.
//  In the future this might be used again so leaving it here. Also, I never fully made the validation work. To make this all
//      nice we should probably create a reusable input that is based on the PrefixedName one... but that seems like a lot of work
//      might be easier to figure out custom styling within JSON Forms just for the "Time Travel" forms
function NotDateTime({ collectionName, description, label, setting }: Props) {
    const idValue = `${setting}-picker__${collectionName}`;
    const { state, buttonRef, events } = useDatePickerState(idValue);

    // const updateFullSourceProperty =
    //     useResourceConfig_updateFullSourceProperty();
    // const propertyBeingControlled =
    //     useResourceConfig_fullSourceOfCollectionProperty(
    //         collectionName,
    //         setting
    //     );

    // const [localValue, setLocalValue] = useState(propertyBeingControlled ?? '');
    const [localValue, setLocalValue] = useState('');

    const [errors, setErrors] = useState<string | null>(null);

    const showErrors = Boolean(errors);
    const firstFormHelperText = description
        ? description
        : showErrors
          ? errors
          : null;
    const secondFormHelperText = description && showErrors ? errors : null;

    const updateState = (updateValue: any) => {
        setLocalValue(updateValue);
        // updateFullSourceProperty(collectionName, setting, updateValue);
    };

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
                onFocus={events.focus}
                onKeyDown={events.keyDown}
            >
                <InputLabel htmlFor={`${idValue}__input`} required={false}>
                    {label}
                </InputLabel>

                <Input
                    id={`${idValue}__input`}
                    value={localValue}
                    onChange={(event) => {
                        const newVal = event.target.value;

                        updateState(newVal);
                        const validationResponse = validateDateTime(newVal);

                        setErrors(validationResponse[0] ?? null);
                    }}
                    onKeyDown={events.keyDown}
                    onError={(errorValue) => {
                        setErrors('');
                    }}
                />
                <FormHelperText error={showErrors ? !description : undefined}>
                    {firstFormHelperText}
                </FormHelperText>
                <FormHelperText error={showErrors}>
                    {secondFormHelperText}
                </FormHelperText>
            </FormControl>

            <DateTimePickerCTA
                enabled={true}
                label={label}
                buttonRef={buttonRef}
                state={state}
                removeOffset
                value={localValue}
                onChange={(value) => {
                    updateState(value);
                }}
            />
        </Stack>
    );
}

export default NotDateTime;
