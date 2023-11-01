import { MutableRefObject, useCallback } from 'react';

// Pass a ref and this will make sure it is scrolled into view
//  The settings try to make it feel like the object is centered on the page
//  eventually we should allow those settings to be passed but skipped for now
//  as the main use are errors are the top of the create/edit pages (Q4 2023)
function useScrollIntoView(target: MutableRefObject<any>) {
    return useCallback(
        (scrollTarget?: MutableRefObject<any>) => {
            const el = scrollTarget ?? target;
            el.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        },
        [target]
    );
}

export default useScrollIntoView;
