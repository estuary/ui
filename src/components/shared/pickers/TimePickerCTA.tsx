import { StaticTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { Clock } from 'iconoir-react';
import { Patterns } from 'types/jsonforms';
import { PickerProps } from './types';
import DateOrTimePickerWrapper from './DateOrTimePickerWrapper';

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
                value={value}
                onChange={(onChangeValue: any) => {
                    if (onChangeValue) {
                        const formattedValue = formatDate(onChangeValue);
                        if (formattedValue && formattedValue !== INVALID_TIME) {
                            return onChange(formattedValue, onChangeValue);
                        }
                    }
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

export default TimePickerCTA;
