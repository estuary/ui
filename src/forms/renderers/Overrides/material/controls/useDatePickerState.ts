import { useMemo, useRef } from 'react';

import { usePopupState } from 'material-ui-popup-state/hooks';

// TODO (accessibility) Setting the `disableAutoFocus` means this pop up is not
//   accessible at all. We do this because it makes the showing/hiding when clicking
//   make a lot more sense. When auto focus is on if you click away from the picker
//   it does not close.
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
    }, [state]);

    return {
        state,
        buttonRef,
        events,
    };
}

export default useDatePickerState;
