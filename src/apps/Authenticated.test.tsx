import '@testing-library/jest-dom';
import { customRender } from '../utils/test-utils';
import Authenticated from './Authenticated';

test('Authenticated app renders correctly', async () => {
    const { container } = await customRender(<Authenticated />, {
        user: 'FooBar123',
    });

    expect(container).toMatchSnapshot();
});
