import {
    PickersLayoutContentWrapper,
    PickersLayoutProps,
    PickersLayoutRoot,
    StaticDateTimePicker,
    usePickerLayout,
} from '@mui/x-date-pickers';
import { formatRFC3339, parseISO } from 'date-fns';
import { Calendar } from 'iconoir-react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { INVALID_DATE, TIMEZONE_OFFSET_REPLACEMENT } from './shared';
import { PickerProps } from './types';
import DateOrTimePickerWrapper from './DateOrTimePickerWrapper';

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

export function CustomLayout(props: PickersLayoutProps<any, any, any>) {
    const { shortcuts, toolbar, tabs, content } = usePickerLayout(props);
    return (
        <PickersLayoutRoot
            ownerState={{
                isLandscape: false,
            }}
        >
            {toolbar}
            {shortcuts}
            <PickersLayoutContentWrapper>
                {tabs}
                {content}
                <Typography
                    sx={{
                        textAlign: 'right',
                        marginRight: 2,
                        marginBottom: 1,
                    }}
                    variant="caption"
                >
                    <FormattedMessage id="dateTimePicker.picker.footer" />
                </Typography>
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
                ampm={false}
                disabled={!enabled}
                displayStaticWrapperAs="desktop"
                openTo="day"
                defaultValue={parseISO(cleanedValue)}
                slots={{
                    layout: CustomLayout,
                }}
                onAccept={state.close}
                onChange={(onChangeValue: any) => {
                    if (onChangeValue) {
                        const formattedValue = formatDate(onChangeValue);
                        if (formattedValue && formattedValue !== INVALID_DATE) {
                            return onChange(formattedValue, onChangeValue);
                        }
                    }
                }}
            />
        </DateOrTimePickerWrapper>
    );
}

export default DateTimePickerCTA;
