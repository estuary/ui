import '@testing-library/jest-dom';
import { customRender } from '../utils/test-utils';
import Unauthenticated from './Unauthenticated';

test('Unauthenticated app renders correctly', async () => {
    const { container } = await customRender(<Unauthenticated />, {
        route: '/login',
    });

    expect(container).toMatchSnapshot();
});
