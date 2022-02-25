import create from 'zustand';
import { devtools } from 'zustand/middleware';

// TODO: Create a distinct capture state slice that is spread into the change set store.

export interface CaptureState<T = any> {
    addCapture: (key: string, newCapture: T) => void;
    captures: { [key: string]: T };
}

const useChangeSetStore = create<CaptureState>(
    devtools(
        (set) => ({
            addCapture: (key, newCapture) =>
                set(
                    (state) => ({
                        captures: { ...state.captures, [key]: newCapture },
                    }),
                    false,
                    'New Capture Added'
                ),
            captures: {},
        }),
        { name: 'ChangeSetState' }
    )
);

export default useChangeSetStore;
