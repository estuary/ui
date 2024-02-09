import { render } from '@testing-library/react';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import { renderOps } from 'test/test-utils';
import UserMenu from '../UserMenu';

const renderComponent = () => {
    console.log('renderComponent');
    return render(
        <AuthenticatedOnlyContext>
            <UserMenu iconColor="red" />
        </AuthenticatedOnlyContext>,
        renderOps
    );
};

describe('UserMenu', () => {
    test('should render', async () => {
        const rendered = renderComponent();

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
