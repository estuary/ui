import { useBindingsEditorStore } from '../create';

describe('useBindingsEditorStore', () => {
    test('store need includes array with one element', () => {
        const testStore = useBindingsEditorStore.getState();
        expect(testStore).toMatchSnapshot();
    });
});
