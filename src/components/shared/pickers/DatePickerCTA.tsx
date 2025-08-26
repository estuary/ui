import type { PickerProps } from 'src/components/shared/pickers/types';

import { StaticDatePicker } from '@mui/x-date-pickers';

import { format, parseISO } from 'date-fns';
import { Calendar } from 'iconoir-react';

import DateOrTimePickerWrapper from 'src/components/shared/pickers/DateOrTimePickerWrapper';
import { INVALID_DATE } from 'src/components/shared/pickers/shared';
import { Patterns } from 'src/types/jsonforms';

function DatePickerCTA(props: PickerProps) {
    const { enabled, state, value, onChange } = props;

    const formatDate = (formatValue: Date) => {
        try {
            return format(formatValue, Patterns.date);
        } catch (e: unknown) {
            return INVALID_DATE;
        }
    };

    return (
        <DateOrTimePickerWrapper
            icon={<Calendar />}
            iconAriaId="datePicker.button.ariaLabel"
            {...props}
        >
            <StaticDatePicker
                displayStaticWrapperAs="desktop"
                openTo="day"
                disabled={!enabled}
                defaultValue={parseISO(value)}
                onChange={(onChangeValue: any) => {
                    if (onChangeValue) {
                        const formattedValue = formatDate(onChangeValue);
                        if (formattedValue && formattedValue !== INVALID_DATE) {
                            return onChange(formattedValue, onChangeValue);
                        }
                    }
                }}
                onAccept={(_value) => {
                    state.close();
                }}
            />
        </DateOrTimePickerWrapper>
    );
}

export default DatePickerCTA;
