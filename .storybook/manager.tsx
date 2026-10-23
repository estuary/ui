import React from 'react';

import { IconButton } from 'storybook/internal/components';
import { addons, types, useGlobals } from 'storybook/manager-api';

function ColorModeToggle() {
    const [globals, updateGlobals] = useGlobals();
    const dark = globals.colorMode === 'dark';
    const label = `Switch to ${dark ? 'light' : 'dark'} mode`;

    return (
        <IconButton
            title={label}
            aria-label={label}
            aria-pressed={dark}
            active={dark}
            onClick={() =>
                updateGlobals({ colorMode: dark ? 'light' : 'dark' })
            }
        >
            <span aria-hidden="true">{dark ? '☾' : '☀'}</span>
        </IconButton>
    );
}

addons.register('estuary/color-mode', () => {
    addons.add('estuary/color-mode/toggle', {
        type: types.TOOL,
        title: 'Color mode',
        render: ColorModeToggle,
    });
});
