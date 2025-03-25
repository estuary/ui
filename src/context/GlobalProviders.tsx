import { createClient } from '@supabase/supabase-js';
import FullPageSpinner from 'components/fullPage/Spinner';
import { initLogRocket } from 'services/logrocket';
import type { BaseComponentProps } from 'types';
import { enableMapSet, setAutoFreeze } from 'immer';
import { useUserStore } from './User/useUserContextStore';

// This is not a normal provider... more like a guard... kind of. This is here so that we know createClient is called early and also
//  so it is called in a somewhat consistent order. This is also waiting until the client has been
//  constructed before letting the application start rendering.

if (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
    throw new Error(
        'You must set the Supabase url and anon key in the env settings.'
    );
}

// Put global initializing code early. The LogRocket one _MUST_ be done
//  before the `createClient` call made below for Supabase
initLogRocket();

// TODO (logrocket | compliance)
// Eventually we need to make sure to not include LR for certain tenants
//  that have some setting enabled. Eventually this check should just set
//  a variable that is then consumer deeper in the application (once we have the tenant)
//  and then we can load in the file

// TODO (integrity | logrocket)
// This code chunk can be put back in if we want to load in LogRocket manually
// if (
//     import.meta.env.VITE_LOGROCKET_ENABLED === 'true' &&
//     import.meta.env.VITE_LOGROCKET_URL !== ''
// ) {
//     const LR_INTEGRITY = `${import.meta.env.VITE_LOGROCKET_SHA_ENCODING}-${
//         import.meta.env.VITE_LOGROCKET_SHA
//     }`;
//     if (LR_INTEGRITY !== '-') {
//         (() => {
//             const script = document.createElement('script');
//             script.async = true;
//             script.crossOrigin = 'crossorigin';
//             script.integrity = LR_INTEGRITY;
//             script.src = import.meta.env.VITE_LOGROCKET_URL;

//             // Once loaded we can init LogRocket
//             script.onload = () => {
//                 initLogRocket();
//             };

//             document.body.appendChild(script);
//         })();
//     }
// }

// Setup immer
enableMapSet();
setAutoFreeze(false);

// Setup Supabase
const supabaseSettings = {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

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
