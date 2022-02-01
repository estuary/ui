import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Topbar from './Topbar';

test('there is a help menu available', () => {
    const mockNavToggle = () => {
        return null;
    };

    render(
        <Topbar isNavigationOpen={false} onNavigationToggle={mockNavToggle} />
    );

    expect(screen.queryByLabelText('Open help')).toBeInTheDocument();
});
