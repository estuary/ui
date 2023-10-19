import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import { useOnLoadSpinner } from './OnLoadSpinnerContext';

interface Props extends BaseComponentProps {
    display: boolean;
}

function OnLoadSpinner({ children, display }: Props) {
    const { setLoading } = useOnLoadSpinner();

    console.log('OnLoadSpinner', display);

    useEffect(() => {
        setLoading(display);
    }, [display, setLoading]);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default OnLoadSpinner;
