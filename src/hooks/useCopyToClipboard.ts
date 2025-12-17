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
                    logRocketEvent('Error_Silent', {
                        copiedValue: value,
                        component: componentName,
                    });
                }
            );
        }
    };

    return { isCopied, setIsCopied, handleCopy };
}
