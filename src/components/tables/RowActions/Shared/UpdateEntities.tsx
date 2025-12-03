import type { UseMassUpdaterProps } from 'src/hooks/useMassUpdater';

import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import Error from 'src/components/shared/Error';
import SharedProgress from 'src/components/tables/RowActions/Shared/Progress';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import useMassUpdater from 'src/hooks/useMassUpdater';

function UpdateEntities(props: UseMassUpdaterProps) {
    const intl = useIntl();

    const { entities, runningIntlKey, successIntlKey, titleIntlKey } = props;

    const { massUpdateEntities, draftId, error, logToken, state } =
        useMassUpdater(props);

    const updating = entities?.length ?? 0;

    useMount(() => {
        void massUpdateEntities(entities);
    });

    return (
        <SharedProgress
            name={intl.formatMessage({ id: titleIntlKey }, { updating })}
            groupedEntities={entities}
            error={error}
            logToken={logToken}
            renderLogs
            renderError={(renderError_error, renderError_state) => {
                const skipped = renderError_state === ProgressStates.SKIPPED;

                console.log('renderError', {
                    renderError_error,
                    renderError_state,
                    draftId,
                });

                return (
                    <>
                        {draftId ? (
                            <DraftErrors draftId={draftId} enableAlertStyling />
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
            runningIntlKey={runningIntlKey}
            successIntlKey={successIntlKey}
            titleIntlKey={titleIntlKey}
        />
    );
}

export default UpdateEntities;
