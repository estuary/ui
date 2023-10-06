import { StaticDatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { Calendar } from 'iconoir-react';
import { Patterns } from 'types/jsonforms';
import { INVALID_DATE } from './shared';
import { PickerProps } from './types';
import DateOrTimePickerWrapper from './DateOrTimePickerWrapper';

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
                ignoreInvalidInputs
                disableMaskedInput
                displayStaticWrapperAs="desktop"
                openTo="day"
                disabled={!enabled}
                value={value}
                onChange={(
                    onChangeValue: any,
                    keyboardInput?: string | undefined
                ) => {
                    if (onChangeValue) {
                        const formattedValue = formatDate(onChangeValue);
                        if (formattedValue && formattedValue !== INVALID_DATE) {
                            return onChange(formattedValue, onChangeValue);
                        }
                    }

                    // Default to setting to what user typed
                    //  This is a super backup as with the Date Fn adapter
                    //  it never fell through to this... but wanted to be safe
                    return onChange(keyboardInput, keyboardInput);
                }}
                onAccept={state.close}
                closeOnSelect={true}
                // We don't need an input
                // eslint-disable-next-line react/jsx-no-useless-fragment
                renderInput={() => <></>}
            />
        </DateOrTimePickerWrapper>
    );
}

export default DatePickerCTA;
