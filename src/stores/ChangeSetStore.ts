import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// TODO: Create a distinct capture state slice that is spread into the change set store.
export interface CaptureState<T = any> {
    addCapture: (key: string, newCapture: T) => void;
    captures: { [key: string]: T };
    hydrateCaptureState: () => void;
}

const name = 'change-set-state';

// TODO: Look into a better way to hydrate the state.
const useChangeSetStore = create<CaptureState>(
    devtools(
        persist(
            (set, get) => ({
                addCapture: (key, newCapture) =>
                    set(
                        (state) => ({
                            captures: { ...state.captures, [key]: newCapture },
                        }),
                        false,
                        'New Capture Added'
                    ),
                captures: {},
                hydrateCaptureState: () =>
                    set(
                        (state) => ({
                            captures: { ...state.captures, ...get().captures },
                        }),
                        false,
                        'Capture State Hydrated'
                    ),
            }),
            { name }
        ),
        { name }
    )
);

export default useChangeSetStore;
