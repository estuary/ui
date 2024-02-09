import { render } from '@testing-library/react';
import { renderOps } from 'test/test-utils';
import UserMenu from '../UserMenu';

const renderComponent = () => {
    console.log('renderComponent');
    return render(<UserMenu iconColor="red" />, renderOps);
};

describe('UserMenu', () => {
    test('should render', async () => {
        const rendered = renderComponent();

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
