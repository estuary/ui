import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';
import { useGuardWaiting } from './GuardWaiting';

function OnLoadSpinnerHide({ children }: BaseComponentProps) {
    const { toggleWaiting } = useGuardWaiting();

    useEffectOnce(() => {
        toggleWaiting(false);
    });

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default OnLoadSpinnerHide;
