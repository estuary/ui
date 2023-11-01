import { RefObject, useCallback } from 'react';

function useScrollIntoView(target: RefObject<HTMLDivElement>) {
    return useCallback(
        (
            scrollTarget?: RefObject<HTMLDivElement | null>,
            options?: ScrollIntoViewOptions | boolean
        ) => {
            const el = scrollTarget ?? target;
            el.current?.scrollIntoView(
                options ?? {
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                }
            );
        },
        [target]
    );
}

export default useScrollIntoView;
