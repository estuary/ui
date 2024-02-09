import { render } from '@testing-library/react';
import { renderOps } from 'test/test-utils';
import MaterializeGenerateButton from '../GenerateButton';

describe('MaterializeGenerateButton', () => {
    test('should render', async () => {
        const rendered = render(
            <MaterializeGenerateButton disabled={false} />,
            renderOps
        );

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
