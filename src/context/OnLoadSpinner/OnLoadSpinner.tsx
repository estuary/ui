import { useEffect } from 'react';

import { useOnLoadSpinner } from './OnLoadSpinnerContext';

import { BaseComponentProps } from 'src/types';

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
