import type { PickersLayoutProps } from '@mui/x-date-pickers';
import type { PickerProps } from 'src/components/shared/pickers/types';

import { useMemo } from 'react';

import { Box, Typography } from '@mui/material';
import {
    PickersLayoutContentWrapper,
    PickersLayoutRoot,
    StaticDateTimePicker,
    usePickerLayout,
} from '@mui/x-date-pickers';

import { formatRFC3339, parseISO } from 'date-fns';
import { Calendar } from 'iconoir-react';
import { useIntl } from 'react-intl';

import DateOrTimePickerWrapper from 'src/components/shared/pickers/DateOrTimePickerWrapper';
import {
    INVALID_DATE,
    TIMEZONE_OFFSET_REPLACEMENT,
} from 'src/components/shared/pickers/shared';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { isReactElement } from 'src/utils/misc-utils';

const TIMEZONE_OFFSET = new RegExp('([+-][0-9]{2}:[0-9]{2})$');

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

export function CustomLayout(props: PickersLayoutProps<any>) {
    const intl = useIntl();
    const { shortcuts, toolbar, tabs, content, ownerState } =
        usePickerLayout(props);

    let currentStep = '';
    if (isReactElement(content)) {
        currentStep = content.props.focusedView ?? content.props.view ?? '';
    }

    return (
        <PickersLayoutRoot
            ownerState={{
                ...ownerState,
                pickerOrientation: 'portrait',
            }}
        >
            {toolbar}
            {shortcuts}
            <PickersLayoutContentWrapper ownerState={ownerState}>
                <>
                    {tabs}
                    {content}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 2,
                            marginX: 1,
                            textTransform: 'capitalize',
                        }}
                    >
                        <Typography variant="caption">
                            {intl.formatMessage(
                                {
                                    id: 'dateTimePicker.picker.currentStep',
                                },
                                { currentStep }
                            )}
                        </Typography>

                        <Typography variant="caption">
                            {intl.formatMessage({
                                id: 'dateTimePicker.picker.footer',
                            })}
                        </Typography>
                    </Box>
                </>
            </PickersLayoutContentWrapper>
        </PickersLayoutRoot>
    );
}

// TODO (date time picker) weird date formatting issue
// If the user types in a short value (that can be parsed as a date. ex: "1", "12", etc.) If they open the date picker
//  and then select the same date that was parsed no change event is fired. This is a weird edge case so not
//  going to handle it right now (Q4 2023)
function DateTimePickerCTA(props: PickerProps) {
    const { enabled, state, value, onChange, removeOffset } = props;

    // We need to remove the Z here so that the date time picker
    //  can open up to the proper date time but not try to adjust
    //  it with the local timezone offset
    const cleanedValue = useMemo(() => {
        // If we can format then we're good to use that value
        if (removeOffset) {
            return value ? value.replace(TIMEZONE_OFFSET_REPLACEMENT, '') : '';
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
                ampm={false}
                disabled={!enabled}
                displayStaticWrapperAs="desktop"
                openTo="day"
                views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                defaultValue={parseISO(cleanedValue)}
                slots={{
                    layout: CustomLayout,
                }}
                onAccept={(_value) => {
                    state.close();
                }}
                onChange={(onChangeValue: any) => {
                    if (onChangeValue) {
                        const formattedValue = formatDate(onChangeValue);
                        if (formattedValue && formattedValue !== INVALID_DATE) {
                            logRocketEvent(
                                CustomEvents.DATE_TIME_PICKER_CHANGE,
                                {
                                    formattedValue,
                                    onChangeValue,
                                }
                            );
                            return onChange(formattedValue, onChangeValue);
                        }
                    }
                }}
            />
        </DateOrTimePickerWrapper>
    );
}

export default DateTimePickerCTA;
