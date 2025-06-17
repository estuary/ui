import type { DescriptionProps } from 'src/components/shared/Entity/IncompatibleCollections/types';

import { useIntl } from 'react-intl';

function Description({
    evolutionRequest,
    helpMessageId,
    recreateCause,
}: DescriptionProps) {
    const intl = useIntl();

    const materializationCount = evolutionRequest.materializations?.length;
    const materializationName =
        materializationCount === 1
            ? evolutionRequest.materializations?.[0]
            : undefined;

    return (
        <>
            {intl.formatMessage(
                {
                    id: `entityEvolution.action.${helpMessageId}.description`,
                },
                {
                    materializationName,
                    materializationCount,
                    reason: intl.formatMessage({
                        id: `entityEvolution.action.reason.${recreateCause}`,
                    }),
                }
            )}
        </>
    );
}

export default Description;
