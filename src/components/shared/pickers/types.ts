import type { PopupState } from 'material-ui-popup-state/hooks';
import type { MutableRefObject } from 'react';

export interface PickerProps {
    buttonRef: MutableRefObject<null>;
    enabled: boolean;
    label: string;
    onChange: (formattedValue: any, rawValue: any) => void;
    state: PopupState;
    value: any;
    futureOnly?: boolean;
    maxDate?: any;
    removeOffset?: boolean;
}
