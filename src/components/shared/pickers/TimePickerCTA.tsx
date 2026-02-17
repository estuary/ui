import type { PickersLayoutProps } from '@mui/x-date-pickers';
import type { PickerViewRenderer } from '@mui/x-date-pickers/internals';
import type { PickerProps } from 'src/components/shared/pickers/types';

import { forwardRef } from 'react';

import {
    PickersLayoutContentWrapper,
    PickersLayoutRoot,
    renderMultiSectionDigitalClockTimeView,
    StaticTimePicker,
    usePickerLayout,
} from '@mui/x-date-pickers';

import { format } from 'date-fns';
import { Clock } from 'iconoir-react';

import { CustomLayoutWrapper } from 'src/components/shared/pickers/CustomLayoutWrapper';
import DateOrTimePickerWrapper from 'src/components/shared/pickers/DateOrTimePickerWrapper';
import { MINUTES_STEP } from 'src/components/shared/pickers/shared';
import { Patterns } from 'src/types/jsonforms';

const INVALID_TIME = 'Invalid Time';

export const CustomLayout = forwardRef<HTMLDivElement, PickersLayoutProps<any>>(
    function CustomLayout(props, ref) {
        const { actionBar, content, ownerState } = usePickerLayout(props);

        return (
            <PickersLayoutRoot ref={ref} ownerState={ownerState}>
                <PickersLayoutContentWrapper ownerState={ownerState}>
                    <CustomLayoutWrapper>
                        {content}
                        {actionBar}
                    </CustomLayoutWrapper>
                </PickersLayoutContentWrapper>
            </PickersLayoutRoot>
        );
    }
);

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
                ampm={false}
                defaultValue={value} // The value does not need parseISO like the dates
                disabled={!enabled}
                displayStaticWrapperAs="desktop"
                minutesStep={MINUTES_STEP}
                slots={{ layout: CustomLayout }}
                onAccept={() => state.close()}
                onClose={() => state.close()}
                onChange={(onChangeValue: any) => {
                    if (onChangeValue) {
                        const formattedValue = formatDate(onChangeValue);
                        if (formattedValue && formattedValue !== INVALID_TIME) {
                            return onChange(formattedValue, onChangeValue);
                        }
                    }
                }}
                viewRenderers={{
                    hours: renderMultiSectionDigitalClockTimeView as PickerViewRenderer<
                        any,
                        any
                    >,
                    minutes:
                        renderMultiSectionDigitalClockTimeView as PickerViewRenderer<
                            any,
                            any
                        >,
                }}
            />
        </DateOrTimePickerWrapper>
    );
}

export default TimePickerCTA;
