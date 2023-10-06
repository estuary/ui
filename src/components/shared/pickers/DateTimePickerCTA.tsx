import { StaticDateTimePicker } from '@mui/x-date-pickers';
import { formatRFC3339 } from 'date-fns';
import { Calendar } from 'iconoir-react';
import { useMemo } from 'react';
import { INVALID_DATE, TIMEZONE_OFFSET_REPLACEMENT } from './shared';
import { PickerProps } from './types';
import DateOrTimePickerWrapper from './DateOrTimePickerWrapper';

const TIMEZONE_OFFSET = new RegExp('([+-][0-9]{2}:[0-9]{2})$');

function DateTimePickerCTA(props: PickerProps) {
    const { enabled, state, value, onChange, removeOffset } = props;

    // We have a special handler that formats the date so that
    //  it can handle if there was an error formatting, always
    //  use RFC3339, replace the seconds with 'OO'
    //  and replace the TZ Offset with an actual "Z"
    const formatDate = (formatValue: Date) => {
        try {
            return formatRFC3339(formatValue).replace(
                TIMEZONE_OFFSET,
                TIMEZONE_OFFSET_REPLACEMENT
            );
        } catch (e: unknown) {
            return INVALID_DATE;
        }
    };

    // We need to remove the Z here so that the date time picker
    //  can open up to the proper date time but not try to adjust
    //  it with the local timezone offset
    const cleanedValue = useMemo(() => {
        if (removeOffset) {
            return value
                ? value.replace(TIMEZONE_OFFSET_REPLACEMENT, '')
                : null;
        }

        return value;
    }, [removeOffset, value]);

    return (
        <DateOrTimePickerWrapper
            icon={<Calendar />}
            iconAriaId="dateTimePicker.button.ariaLabel"
            {...props}
        >
            <StaticDateTimePicker
                ignoreInvalidInputs
                disableMaskedInput
                displayStaticWrapperAs="desktop"
                openTo="day"
                ampm={false}
                disabled={!enabled}
                value={cleanedValue}
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

export default DateTimePickerCTA;
