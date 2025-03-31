import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { useOnLoadSpinner } from 'src/context/OnLoadSpinner/OnLoadSpinnerContext';

interface Props extends BaseComponentProps {
    display: boolean;
}

function OnLoadSpinner({ children, display }: Props) {
    const { setLoading } = useOnLoadSpinner();

    useEffect(() => {
        setLoading(display);
    }, [display, setLoading]);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default OnLoadSpinner;
