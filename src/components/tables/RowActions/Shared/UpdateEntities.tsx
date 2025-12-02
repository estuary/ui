import type { UseMassUpdaterProps } from 'src/hooks/useMassUpdater';

import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import Error from 'src/components/shared/Error';
import SharedProgress from 'src/components/tables/RowActions/Shared/Progress';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import useMassUpdater from 'src/hooks/useMassUpdater';

function UpdateEntities(props: UseMassUpdaterProps) {
    const intl = useIntl();

    const { entities, runningMessageID, successMessageID } = props;

    const { massUpdateEntities, draftId, error, logToken, state } =
        useMassUpdater(props);

    const updating = entities?.length ?? 0;

    useMount(() => {
        void massUpdateEntities(entities);
    });

    return (
        <SharedProgress
            name={intl.formatMessage(
                { id: 'entityTable.update.title' },
                { updating }
            )}
            error={error}
            logToken={logToken}
            renderLogs
            renderError={(renderError_error, renderError_state) => {
                const skipped = renderError_state === ProgressStates.SKIPPED;

                if (renderError_error?.message) {
                    return (
                        <Error
                            error={renderError_error}
                            severity={skipped ? 'info' : undefined}
                            hideIcon={skipped}
                            condensed
                            hideTitle
                        />
                    );
                } else if (draftId) {
                    return (
                        <AlertBox short hideIcon severity="error">
                            <DraftErrors draftId={draftId} />
                        </AlertBox>
                    );
                } else {
                    return null;
                }
            }}
            state={state}
            runningMessageID={runningMessageID}
            successMessageID={successMessageID}
        />
    );
}

export default UpdateEntities;
