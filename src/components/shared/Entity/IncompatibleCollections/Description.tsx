import { FormattedMessage, useIntl } from 'react-intl';

import { AffectedMaterialization, RequiresRecreation } from 'api/evolutions';

interface Props {
    newName: string | null;
    recreateCause: RequiresRecreation | null;
    affectedMaterializations?: AffectedMaterialization[];
}

function Description({
    affectedMaterializations,
    newName,
    recreateCause,
}: Props) {
    const intl = useIntl();

    if (newName !== null) {
        const reason = intl.formatMessage({
            id: `entityEvolution.action.recreateCollection.reason.${recreateCause}`,
        });
        return (
            <FormattedMessage
                id="entityEvolution.action.recreateCollection.description"
                values={{ newName, reason }}
            />
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
            <FormattedMessage
                id="entityEvolution.action.recreateOneBinding.description"
                values={{
                    materializationName,
                }}
            />
        );
    }

    return (
        <FormattedMessage
            id="entityEvolution.action.recreateBindings.description"
            values={{
                materializationCount,
            }}
        />
    );
}

export default Description;
