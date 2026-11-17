import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { LocalStorageKeys } from 'src/utils/localStorage-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

interface NavigationState {
    // Whether the side navigation is expanded (true) or collapsed to the rail.
    open: boolean;
    setOpen: (open: boolean) => void;
    toggleOpen: () => void;
}

export const useNavigationStore = create<NavigationState>()(
    persist(
        devtools(
            (set) => ({
                open: true,
                setOpen: (open) => set({ open }, false, 'setOpen'),
                toggleOpen: () =>
                    set(
                        (state) => ({ open: !state.open }),
                        false,
                        'toggleOpen'
                    ),
            }),
            devtoolsOptions(LocalStorageKeys.NAVIGATION_SETTINGS)
        ),
        {
            name: LocalStorageKeys.NAVIGATION_SETTINGS,
            version: 0,
            partialize: (state) => ({ open: state.open }),
        }
    )
);
