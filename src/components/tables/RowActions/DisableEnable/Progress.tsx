import SharedProgress, {
    ProgressStates,
} from 'components/tables/RowActions/Shared/Progress';
import useLiveSpecsExt from 'hooks/useLiveSpecsExt';
import { useEffect, useState } from 'react';

interface Props {
    entity: any;
    onFinish: (response: any) => void;
    enabling: boolean;
}

function DisableEnableProgress({ enabling, entity, onFinish }: Props) {
    const [state, setState] = useState<ProgressStates>(ProgressStates.RUNNING);
    const [error, setError] = useState<any | null>(null);

    const { liveSpecs } = useLiveSpecsExt(entity.last_pub_id, true);

    useEffect(() => {
        console.log('Progress use effect');

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
                liveSpecs,
            });
        };

        if (liveSpecs.length > 0) {
            void makeDisableCall(entity);
        }
    }, [enabling, entity, liveSpecs, onFinish]);

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
