import { render } from '@testing-library/react';
import { AuthenticatedOnlyContext } from 'context/Authenticated';
import { EntityContextProvider } from 'context/EntityContext';
import { renderOps } from 'test/test-utils';
import { Entity } from 'types';
import MaterializeGenerateButton from '../GenerateButton';

const renderComponent = (entityType: Entity) => {
    return render(
        <AuthenticatedOnlyContext>
            <EntityContextProvider value={entityType}>
                <MaterializeGenerateButton disabled={false} />
            </EntityContextProvider>
        </AuthenticatedOnlyContext>,
        renderOps
    );
};

describe('MaterializeGenerateButton', () => {
    test('should render', async () => {
        const rendered = renderComponent('materialization');

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
