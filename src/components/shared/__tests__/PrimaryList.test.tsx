import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PrimaryList } from 'src/components/shared/PrimaryList';

beforeEach(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        }
    );
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
});

afterEach(() => vi.unstubAllGlobals());

test('promotes the chosen primary and preserves the other items’ order', async () => {
    const items = ['First', 'Second', 'Third'];
    const onChange = vi.fn();
    const renderLabel = (item: string) => item;
    const { rerender } = render(
        <PrimaryList
            items={items}
            onChange={onChange}
            renderLabel={renderLabel}
        />
    );

    await userEvent.click(
        within(
            screen.getByText('Third').parentElement as HTMLElement
        ).getByRole('button', { name: 'select as default' })
    );

    expect(onChange).toHaveBeenCalledExactlyOnceWith([
        'Third',
        'First',
        'Second',
    ]);
    rerender(
        <PrimaryList
            items={onChange.mock.calls[0][0]}
            onChange={onChange}
            renderLabel={renderLabel}
        />
    );

    expect(
        screen
            .getAllByRole('button', { name: /^Remove / })
            .map((button) => button.getAttribute('aria-label'))
    ).toEqual(['Remove Third', 'Remove First', 'Remove Second']);
    expect(
        within(
            screen.getByText('Third').parentElement as HTMLElement
        ).queryByRole('button', { name: 'select as default' })
    ).toBeNull();
});
