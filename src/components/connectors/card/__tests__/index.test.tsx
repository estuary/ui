import { customRender, renderOps } from 'test/test-utils';
import ConnectorCard from '..';

describe('Connector Card', () => {
    const logo = 'example.com/fake/logo.png';
    const details = 'this is a fake connector';
    const title = 'FakeDB';

    it('should display the connector details', async () => {
        const { view } = await customRender(
            <ConnectorCard logo={logo} details={details} title={title} />,
            renderOps
        );
        expect(view).toMatchSnapshot();
    });
});
