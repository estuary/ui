import { customRender, renderOps } from 'test/test-utils';
import ConnectorTiles from '../ConnectorTiles';

describe('Connector Tiles', () => {
    it('should display the connector details', async () => {
        const { view } = await customRender(<ConnectorTiles />, renderOps);

        expect(view).toMatchSnapshot();
    });
});
