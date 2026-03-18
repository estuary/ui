import type { InputBaseComponentProps } from '@mui/material';

import { useMount } from 'react-use';

import useBaseEntityStoreReset from 'src/components/shared/Entity/hooks/useBaseEntityStoreReset';
import { logRocketEvent } from 'src/services/shared';

function StoreCleaner({ children }: InputBaseComponentProps) {
    const baseEntityStoreReset = useBaseEntityStoreReset();

    useMount(() => {
        logRocketEvent('StoreCleaner', {
            mount: true,
        });
        baseEntityStoreReset();
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default StoreCleaner;
