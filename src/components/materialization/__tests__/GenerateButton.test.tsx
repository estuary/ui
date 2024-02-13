import { render } from '@testing-library/react';
import { EntityContextProvider } from 'context/EntityContext';
import { renderOps } from 'test/test-utils';
import { Entity } from 'types';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';

const renderComponent = (entityType: Entity) => {
    return render(
        <EntityContextProvider value={entityType}>
            <MaterializeGenerateButton disabled={false} />
        </EntityContextProvider>,
        renderOps
    );
};

// TODO (testing) this does not actually work yet due to mocking
describe.skip('MaterializeGenerateButton', () => {
    test('should render', async () => {
        const rendered = renderComponent('materialization');

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
