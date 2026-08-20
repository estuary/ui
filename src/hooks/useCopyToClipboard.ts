import { useState } from 'react';

import { logRocketEvent } from 'src/services/shared';

// TODO: use React Context to pass component name instead of an argument
export function useCopyToClipboard(componentName: string) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (value: string | null) => {
        if (value) {
            navigator.clipboard.writeText(value).then(
                () => {
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 3000);
                },
                () => {
                    setIsCopied(false);
                    // The value is deliberately left out: this hook copies
                    // access tokens and API keys, and a failure must not put
                    // them in session telemetry.
                    logRocketEvent('Error_Silent', {
                        component: componentName,
                        operation: 'copyToClipboard',
                    });
                }
            );
        }
    };

    return { isCopied, setIsCopied, handleCopy };
}
