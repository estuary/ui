import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';
import { useOnLoadSpinner } from './OnLoadSpinnerContext';

function OnLoadSpinnerHide({ children }: BaseComponentProps) {
    const { setLoading } = useOnLoadSpinner();

    useEffectOnce(() => {
        setLoading(false);
    });

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default OnLoadSpinnerHide;
