import { render } from '@testing-library/react';
import { renderOps } from 'test/test-utils';
import ConnectorTiles from '../ConnectorTiles';

describe('Connector Tiles', () => {
    it('should display the connector details', async () => {
        const rendered = render(<ConnectorTiles />, renderOps);

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
