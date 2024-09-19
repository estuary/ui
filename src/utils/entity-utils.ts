import { authenticatedRoutes } from 'app/routes';
import {
    semiTransparentBackground_blue,
    semiTransparentBackground_purple,
    semiTransparentBackground_teal,
} from 'context/Theme';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import produce from 'immer';
import { specContainsDerivation } from 'utils/misc-utils';

export const ENTITY_SETTINGS = {
    collection: {
        Icon: DatabaseScript,
        background: semiTransparentBackground_blue,
        pluralId: 'terms.collections.plural',
        route: authenticatedRoutes.collections.fullPath,
        termId: 'terms.collections',
    },
    capture: {
        Icon: CloudUpload,
        background: semiTransparentBackground_teal,
        pluralId: 'terms.sources.plural',
        route: authenticatedRoutes.captures.fullPath,
        termId: 'terms.sources',
    },
    materialization: {
        Icon: CloudDownload,
        background: semiTransparentBackground_purple,
        pluralId: 'terms.destinations.plural',
        route: authenticatedRoutes.materializations.fullPath,
        termId: 'terms.destinations',
    },
};

export const updateShardDisabled = (draftSpec: any, enabling: boolean) => {
    draftSpec.shards ??= {};
    draftSpec.shards.disable = !enabling;
};

export const generateDisabledSpec = (
    spec: any,
    enabling: boolean,
    shardsAreNested: boolean
) => {
    // Make sure we have a spec to update
    if (spec) {
        // Check if we need to place the settings deeper (collections)
        if (shardsAreNested) {
            const { isDerivation, derivationKey } =
                specContainsDerivation(spec);

            // Check if there is a derivation key we can update (derivations)
            //  if the collection is not a derivation then we cannot enable/disable
            if (isDerivation) {
                return produce<typeof spec>(spec, (draftSpec) => {
                    updateShardDisabled(draftSpec[derivationKey], enabling);
                });
            }
        } else {
            // Not nested so we can update the root (captures and materializations)
            return produce<typeof spec>(spec, (draftSpec) => {
                updateShardDisabled(draftSpec, enabling);
            });
        }
    }
};
