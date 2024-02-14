import { render } from '@testing-library/react';
import { renderOps } from 'test/test-utils';
import ConnectorCard from '..';

describe('Connector Card', () => {
    const logo = 'example.com/fake/logo.png';
    const details = 'this is a fake connector';
    const title = 'FakeDB';

    it('should display the connector details', async () => {
        const rendered = render(
            <ConnectorCard logo={logo} details={details} title={title} />,
            renderOps
        );
        expect(rendered.baseElement).toMatchSnapshot();
    });
});
