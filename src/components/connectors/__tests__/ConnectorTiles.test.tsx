import { render } from 'test/test-utils';
import { describe, expect, it } from 'vitest';
import ConnectorTiles from '../ConnectorTiles';

describe('Connector Tiles', () => {
    it('should display the connector details', async () => {
        const rendered = render(<ConnectorTiles />);

        // TODO (testing)
        //      need to get the vitest `expect` wired up to handle matchers from other
        //      libraries and can allow us to wait for stuff to load in
        // await waitFor(() => {
        //     expect(getByText('FooDB')).toBeInTheDocument();
        // });

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
