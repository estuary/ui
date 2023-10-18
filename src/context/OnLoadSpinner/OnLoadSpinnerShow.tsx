import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';
import { useGuardWaiting } from './GuardWaiting';

function OnLoadSpinnerShow({ children }: BaseComponentProps) {
    const { toggleWaiting } = useGuardWaiting();

    useEffectOnce(() => {
        toggleWaiting(true);
    });

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default OnLoadSpinnerShow;
