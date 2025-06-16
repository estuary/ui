import type { DescriptionProps } from 'src/components/shared/Entity/IncompatibleCollections/types';

import { useIntl } from 'react-intl';

function Description({
    affectedMaterializations,
    newName,
    recreateCause,
}: DescriptionProps) {
    const intl = useIntl();

    // TODO (collection reset) - we need to replace this and inform the user here what will happen
    //  but without the new name stuff
    if (newName !== null) {
        return (
            <>
                {intl.formatMessage(
                    {
                        id: 'entityEvolution.action.recreateCollection.description',
                    },
                    {
                        newName,
                        reason: intl.formatMessage({
                            id: `entityEvolution.action.recreateCollection.reason.${recreateCause}`,
                        }),
                    }
                )}
            </>
        );
    }

    const materializationCount = affectedMaterializations?.length;
    const materializationName =
        materializationCount === 1
            ? affectedMaterializations?.[0].name
            : undefined;

    if (materializationName) {
        // We _could_ also provide a reason as part of these. We're not doing so now because the `reason` that's attached to the fields on the AffectedConsumer
        // are way too verbose. We'd need to update connectors to provide much more concise reasons before we present them here. Once/if we do that, then we
        // should be able to format a message using the fields and reasons for each one.
        return (
            <>
                {intl.formatMessage(
                    {
                        id: 'entityEvolution.action.recreateOneBinding.description',
                    },
                    { materializationName }
                )}
            </>
        );
    }

    return (
        <>
            {intl.formatMessage(
                {
                    id: 'entityEvolution.action.recreateBindings.description',
                },
                { materializationCount }
            )}
        </>
    );
}

export default Description;
