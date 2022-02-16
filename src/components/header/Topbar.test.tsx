import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import Topbar from './Topbar';

test('there is a help menu available', () => {
    const mockNavToggle = () => {
        return null;
    };

    render(
        <Topbar isNavigationOpen={false} onNavigationToggle={mockNavToggle} />
    );

    expect(screen.getByLabelText('Open help')).toBeInTheDocument();
});
