import { useState } from 'react';

export function useCopyToClipboard() {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (value: string | null) => {
        if (value) {
            navigator.clipboard.writeText(value).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
            });
        }
    };

    return { isCopied, setIsCopied, handleCopy };
}
