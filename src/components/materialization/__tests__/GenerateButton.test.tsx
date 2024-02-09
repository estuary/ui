import { render } from 'test/test-utils';
import MaterializeGenerateButton from '../GenerateButton';

describe('MaterializeGenerateButton', () => {
    test('should render', async () => {
        const rendered = renderCounter();

        expect(rendered.baseElement).toMatchSnapshot();
    });
});

const renderCounter = () => {
    return render(<MaterializeGenerateButton disabled={false} />);
};
