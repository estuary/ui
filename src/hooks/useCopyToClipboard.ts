import { useState } from 'react';

import { logRocketEvent } from 'src/services/shared';

// TODO: use React Context to pass component name instead of an argument
export function useCopyToClipboard(componentName: string) {
    const [isCopied, setIsCopied] = useState(false);

    // Resolves to whether the value reached the clipboard, for callers that
    // gate something on a successful copy. Callers that only need the button
    // state can ignore it.
    const handleCopy = (value: string | null) => {
        if (!value) {
            return undefined;
        }

        return navigator.clipboard.writeText(value).then(
            () => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
                return true;
            },
            () => {
                setIsCopied(false);
                // The value is deliberately left out: this hook copies access
                // tokens and API keys, and a failure must not put them in
                // session telemetry.
                logRocketEvent('Error_Silent', {
                    component: componentName,
                    operation: 'copyToClipboard',
                });
                return false;
            }
        );
    };

    return { isCopied, setIsCopied, handleCopy };
}
