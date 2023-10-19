import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';
import { useOnLoadSpinner } from './OnLoadSpinnerContext';

interface Props extends BaseComponentProps {
    display: boolean;
}

function OnLoadSpinner({ children, display }: Props) {
    const { setLoading } = useOnLoadSpinner();

    useEffectOnce(() => {
        setLoading(display);
    });

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default OnLoadSpinner;
