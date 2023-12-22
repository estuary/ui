import { getByText, render, waitFor } from 'test/test-utils';
import { describe, it } from 'vitest';
import ConnectorTiles from '../ConnectorTiles';

describe('Connector Tiles', () => {
    it('should display the connector details', async () => {
        const rendered = render(<ConnectorTiles />);

        await waitFor(() => {
            expect(getByText('FooDB')).toBeInTheDocument();
        });

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
