import { render } from 'test/test-utils';
import { describe, expect, it } from 'vitest';
import MaterializeGenerateButton from '../GenerateButton';

describe('MaterializeGenerateButton', () => {
    it('should render', async () => {
        const rendered = render(<MaterializeGenerateButton disabled={false} />);

        // TODO (testing|expect)
        //      need to get the vitest `expect` wired up to handle matchers from other
        //      libraries and can allow us to wait for stuff to load in
        // await waitFor(() => {
        //     expect(getByText('FooDB')).toBeInTheDocument();
        // });

        expect(rendered.baseElement).toMatchSnapshot();
    });
});
