import { useEffect, useState } from 'react';

const TIMEOUT_MS = 3000;

// True once the images are cached, so the menu never opens with blanks.
export const useImagesPreloaded = (urls: (string | null | undefined)[]) => {
    const key = [...new Set(urls.filter(Boolean))].sort().join('\n');
    const [loadedKey, setLoadedKey] = useState<string>();

    useEffect(() => {
        let active = true;
        const done = () => active && setLoadedKey(key);
        const timeout = setTimeout(done, TIMEOUT_MS);

        void Promise.all(
            key
                .split('\n')
                .filter(Boolean)
                .map(
                    (url) =>
                        new Promise((resolve) => {
                            const image = new Image();
                            image.onload = resolve;
                            image.onerror = resolve;
                            image.src = url;
                        })
                )
        ).then(done);

        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [key]);

    return loadedKey === key;
};
