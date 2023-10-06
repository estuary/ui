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
import {
    useResourceConfig_fullSourceOfCollectionProperty,
    useResourceConfig_updateFullSourceProperty,
} from 'stores/ResourceConfig/hooks';
import { FilterProperties } from 'stores/ResourceConfig/types';

interface Props {
    collectionName: string;
    description: string;
    label: string;
    setting: FilterProperties;
}

function NotDateTime({ collectionName, description, label, setting }: Props) {
    const idValue = `${setting}-picker__${collectionName}`;
    const { state, buttonRef, events } = useDatePickerState(idValue);

    const updateFullSourceProperty =
        useResourceConfig_updateFullSourceProperty();
    const propertyBeingControlled =
        useResourceConfig_fullSourceOfCollectionProperty(
            collectionName,
            setting
        );

    const [localValue, setLocalValue] = useState<string>(
        propertyBeingControlled ?? ''
    );

    const updateState = (updateValue: any) => {
        setLocalValue(updateValue);
        updateFullSourceProperty(collectionName, setting, updateValue);
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
                        updateState(event.target.value);
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
