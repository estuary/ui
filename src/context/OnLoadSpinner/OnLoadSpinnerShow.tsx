import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';
import { useOnLoadSpinner } from './OnLoadSpinnerContext';

function OnLoadSpinnerShow({ children }: BaseComponentProps) {
    const { setLoading } = useOnLoadSpinner();

    useEffectOnce(() => {
        setLoading(true);
    });

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default OnLoadSpinnerShow;
