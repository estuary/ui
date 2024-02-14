import { render } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { renderOps } from 'test/test-utils';
import MaterializationEditRoute from '../MaterializationEdit';

const renderComponent = () => {
    return render(
        <Route>
            <MaterializationEditRoute />
        </Route>,
        renderOps
    );
};

// TODO (testing) this does not actually work yet due to mocking
describe.skip('MaterializationEditRoute', () => {
    test('should render', async () => {
        const rendered = renderComponent();

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
