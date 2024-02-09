import * as zustand from 'zustand';
import { act } from 'test/test-utils';

console.log('setting up zustand mocking');

const { create: actualCreate, createStore: actualCreateStore } =
    await vi.importActual<typeof zustand>('zustand');

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set<() => void>();

const createUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
    console.log('createUncurried', stateCreator);

    const store = actualCreate(stateCreator);
    const initialState = store.getInitialState();
    storeResetFns.add(() => {
        store.setState(initialState, true);
    });
    return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
const create = (<T>(stateCreator: zustand.StateCreator<T>) => {
    console.log('zustand create mock', stateCreator);

    // to support curried version of create
    return typeof stateCreator === 'function'
        ? createUncurried(stateCreator)
        : createUncurried;
}) as typeof zustand.create;

const createStoreUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
    console.log('createStoreUncurried', stateCreator);

    const store = actualCreateStore(stateCreator);
    const initialState = store.getInitialState();
    storeResetFns.add(() => {
        store.setState(initialState, true);
    });
    return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
const createStore = (<T>(stateCreator: zustand.StateCreator<T>) => {
    console.log('zustand createStore mock');

    // to support curried version of createStore
    return typeof stateCreator === 'function'
        ? createStoreUncurried(stateCreator)
        : createStoreUncurried;
}) as typeof zustand.createStore;

// reset all stores after each test run
afterEach(() => {
    act(() => {
        storeResetFns.forEach((resetFn) => {
            resetFn();
        });
    });
});

export { create, createStore, storeResetFns };
