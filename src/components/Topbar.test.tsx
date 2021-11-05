import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Topbar from './Topbar';

test('the hardcoded user avatar render', () => {
    const mockNavToggle = () => {
        return null;
    };

    render(
        <Topbar
            title="Estuary Global Actions"
            isNavigationOpen={false}
            onNavigationToggle={mockNavToggle}
        />
    );

    expect(screen.queryByText('EU')).toBeInTheDocument();
});
