import type { RenderErrorProps } from 'src/components/tables/RowActions/Shared/types';

import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import Error from 'src/components/shared/Error';

function RenderError({ draftId, error, skipped }: RenderErrorProps) {
    return (
        <>
            {draftId ? (
                <DraftErrors
                    draftId={draftId}
                    enableAlertStyling
                    maxErrors={5}
                />
            ) : null}

            {error?.message ? (
                <Error
                    error={error}
                    severity={skipped ? 'info' : undefined}
                    hideIcon={skipped}
                    condensed
                    hideTitle
                />
            ) : null}
        </>
    );
}

export default RenderError;
