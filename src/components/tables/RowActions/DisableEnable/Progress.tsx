import SharedProgress, {
    ProgressStates,
} from 'components/tables/RowActions/Shared/Progress';
import { useEffect, useState } from 'react';

interface Props {
    entity: any;
    onFinish: (response: any) => void;
    enabling: boolean;
}

function DisableEnableProgress({ enabling, entity, onFinish }: Props) {
    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);

    useEffect(() => {
        const failed = (response: any) => {
            console.log('response.error', response.error);

            setState(ProgressStates.FAILED);
            setError(response.error);
            onFinish(response);
        };

        const succeeded = (response: any) => {
            setState(ProgressStates.SUCCESS);
            onFinish(response);
        };

        const makeDisableCall = async (spec: any) => {
            console.log('enable disable', {
                enabling,
                spec,
                succeeded,
                failed,
            });
        };

        void makeDisableCall(entity);
    }, [enabling, entity, onFinish]);

    return (
        <SharedProgress
            name={entity.catalog_name}
            error={error}
            state={state}
            successMessageID={enabling ? 'common.enabled' : 'common.disabled'}
            runningMessageID={enabling ? 'common.enabling' : 'common.disabling'}
        />
    );
}

export default DisableEnableProgress;
