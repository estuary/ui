import { usePopupState } from 'material-ui-popup-state/hooks';
import { useMemo, useRef } from 'react';

function useDatePickerState(key: string) {
    const state = usePopupState({
        variant: 'popover',
        popupId: key,
        disableAutoFocus: true,
    });
    const buttonRef = useRef(null);

    const events = useMemo(() => {
        return {
            focus: () => {
                state.open(buttonRef.current);
            },
            keyDown: () => {
                if (state.isOpen) {
                    state.close();
                }
            },
        };
    }, [state, buttonRef]);

    return {
        state,
        buttonRef,
        events,
    };
}

export default useDatePickerState;
