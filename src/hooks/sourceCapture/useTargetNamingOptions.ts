import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { targetNamingOptions } from 'src/stores/SourceCapture/shared';

function useTargetNamingOptions(): any[] {
    const intl = useIntl();

    return useMemo(
        () =>
            targetNamingOptions
                .filter((choice) => {
                    return (
                        choice !== 'leaveEmpty' && choice !== 'fromSourceName'
                    );
                })
                .map((choice) => {
                    return {
                        description: intl.formatMessage({
                            id: `schemaMode.options.${choice}.description`,
                        }),
                        label: intl.formatMessage({
                            id: `schemaMode.options.${choice}.label`,
                        }),
                        val: choice,
                    };
                }),
        [intl]
    );
}

export default useTargetNamingOptions;
