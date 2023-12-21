import { render } from 'test/test-utils';
import { describe, it, expect } from 'vitest';
import ConnectorTiles from '../ConnectorTiles';

describe('Connector Tiles', () => {
    it('should display the connector details', () => {
        const rendered = render(<ConnectorTiles />);
        expect(rendered.baseElement).toMatchSnapshot();
    });
});
