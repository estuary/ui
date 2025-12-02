import type { UseMassUpdaterProps } from 'src/hooks/useMassUpdater';

import { useMount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import Error from 'src/components/shared/Error';
import SharedProgress from 'src/components/tables/RowActions/Shared/Progress';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import useMassUpdater from 'src/hooks/useMassUpdater';

function UpdateEntities(props: UseMassUpdaterProps) {
    const { entities, runningMessageID, successMessageID } = props;

    const { massUpdateEntities, draftId, error, logToken, state } =
        useMassUpdater(props);

    const updating = entities?.length ?? 0;

    useMount(() => {
        void massUpdateEntities(entities);
    });

    if (!draftId) {
        return null;
    }

    return (
        <SharedProgress
            name={`Updating ${updating} collections`}
            error={error}
            logToken={logToken}
            renderLogs
            renderError={(renderError_error, renderError_state) => {
                const skipped = renderError_state === ProgressStates.SKIPPED;

                return (
                    <>
                        {draftId ? (
                            <AlertBox short hideIcon severity="error">
                                <DraftErrors draftId={draftId} />
                            </AlertBox>
                        ) : null}

                        {renderError_error?.message ? (
                            <Error
                                error={renderError_error}
                                severity={skipped ? 'info' : undefined}
                                hideIcon={skipped}
                                condensed
                                hideTitle
                            />
                        ) : null}
                    </>
                );
            }}
            state={state}
            runningMessageID={runningMessageID}
            successMessageID={successMessageID}
        />
    );
}

export default UpdateEntities;
