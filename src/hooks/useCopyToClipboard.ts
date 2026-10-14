import { useState } from 'react';

export function useCopyToClipboard() {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (value: string | null) => {
        if (!value) {
            return;
        }

        void navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        });
    };

    return { isCopied, handleCopy };
}
