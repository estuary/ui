import { useMount, useUnmount } from 'react-use';
import { BaseComponentProps } from 'types';
import { getOsanoSettings } from 'utils/env-utils';

const { bodyClass } = getOsanoSettings();

function Osano({ children }: BaseComponentProps) {
    useMount(() => {
        document.body.classList.add(bodyClass);
    });

    useUnmount(() => {
        document.body.classList.remove(bodyClass);
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default Osano;
