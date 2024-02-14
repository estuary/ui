import { useBindingsEditorStore } from '../create';

describe('useBindingsEditorStore', () => {
    test('store will default itself properly', () => {
        const testStore = useBindingsEditorStore.getState();
        expect(testStore).toMatchSnapshot();
    });
});
