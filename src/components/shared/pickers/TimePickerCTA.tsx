import { StaticTimePicker } from '@mui/x-date-pickers';

import { format } from 'date-fns';
import { Clock } from 'iconoir-react';

import { Patterns } from 'src/types/jsonforms';
import DateOrTimePickerWrapper from 'src/components/shared/pickers/DateOrTimePickerWrapper';
import type { PickerProps } from 'src/components/shared/pickers/types';

const INVALID_TIME = 'Invalid Time';

function TimePickerCTA(props: PickerProps) {
    const { enabled, state, value, onChange } = props;

    const formatDate = (formatValue: Date) => {
        try {
            return format(formatValue, Patterns.time);
        } catch (e: unknown) {
            return INVALID_TIME;
        }
    };

    return (
        <DateOrTimePickerWrapper
            icon={<Clock />}
            iconAriaId="timePicker.button.ariaLabel"
            {...props}
        >
            <StaticTimePicker
                displayStaticWrapperAs="desktop"
                ampm={false}
                disabled={!enabled}
                // The value does not need parseISO like the dates
                defaultValue={value}
                openTo="hours"
                onChange={(onChangeValue: any) => {
                    if (onChangeValue) {
                        const formattedValue = formatDate(onChangeValue);
                        if (formattedValue && formattedValue !== INVALID_TIME) {
                            return onChange(formattedValue, onChangeValue);
                        }
                    }
                }}
                onAccept={state.close}
            />
        </DateOrTimePickerWrapper>
    );
}

export default TimePickerCTA;
