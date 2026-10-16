import type { BaseComponentProps } from 'src/types';

import { enableMapSet, setAutoFreeze } from 'immer';

import FullPageSpinner from 'src/components/fullPage/Spinner';
import { useUserStore } from 'src/context/User/useUserContextStore';

// This is not a normal provider... more like a guard... kind of. It waits
//  until the auth state has initialized before letting the application start
//  rendering.

// PostHog's init is in `ui/src/context/PostHog.tsx`

// Setup immer
enableMapSet();
setAutoFreeze(false);

function GlobalProviders({ children }: BaseComponentProps) {
    const initialized = useUserStore((state) => state.initialized);

    if (!initialized) {
        return <FullPageSpinner />;
    }

    // Only returning the child and need the JSX Fragment
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default GlobalProviders;
