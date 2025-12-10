import type { UseMassUpdaterProps } from 'src/hooks/useMassUpdater';

import { useMount } from 'react-use';

import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import Error from 'src/components/shared/Error';
import GroupedProgress from 'src/components/tables/RowActions/Shared/Progress/GroupedProgress';
import useMassUpdater from 'src/hooks/useMassUpdater';

function UpdateEntities(props: UseMassUpdaterProps) {
    const { entities, runningIntlKey, successIntlKey } = props;

    const { massUpdateEntities, draftId, error, logToken, state } =
        useMassUpdater(props);

    useMount(() => {
        void massUpdateEntities(entities);
    });

    return (
        <GroupedProgress
            error={error}
            logToken={logToken}
            renderLogs
            runningIntlKey={runningIntlKey}
            state={state}
            successIntlKey={successIntlKey}
            updatingCount={entities?.length ?? 0}
            renderError={(renderError_error, renderError_state) => {
                return (
                    <>
                        {draftId ? (
                            <DraftErrors
                                draftId={draftId}
                                enableAlertStyling
                                maxErrors={5}
                            />
                        ) : null}

                        {renderError_error?.message ? (
                            <Error
                                error={renderError_error}
                                condensed
                                hideTitle
                            />
                        ) : null}
                    </>
                );
            }}
        />
    );
}

export default UpdateEntities;
