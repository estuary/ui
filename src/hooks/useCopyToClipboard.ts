import { useState } from 'react';

export function useCopyToClipboard() {
    const [isCopied, setIsCopied] = useState(false);

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
                return false;
            }
        );
    };

    return { isCopied, handleCopy };
}
