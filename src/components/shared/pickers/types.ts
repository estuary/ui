import { PopupState } from 'material-ui-popup-state/hooks';
import { MutableRefObject } from 'react';

export interface PickerProps {
    buttonRef: MutableRefObject<null>;
    enabled: boolean;
    label: string;
    onChange: (formattedValue: any, rawValue: any) => void;
    state: PopupState;
    value: any;
    removeOffset?: boolean;
}
