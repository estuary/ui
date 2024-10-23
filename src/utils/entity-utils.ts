import { authenticatedRoutes } from 'app/routes';
import {
    semiTransparentBackground_blue,
    semiTransparentBackground_purple,
    semiTransparentBackground_teal,
} from 'context/Theme';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import produce from 'immer';
import { specContainsDerivation } from 'utils/misc-utils';

// TODO (typing)
// export interface EntitySetting {
//     Icon: React.ForwardRefExoticComponent<
//         Omit<React.SVGProps<SVGSVGElement>, 'ref'>
//     >;
//     background: { light: any; dark: any };
//     bindingTermId: string;
//     pluralId: string;
//     routes: {
//         details: string;
//         viewAll: string;
//     };
//     termId: string;
// }

// Eventually we'll probably move this out of here as it feels it is beyond the scope
//  of "utils". Also, we'll probably end up nesting message keys together and stuff like that
//  to keep it a bit easier to visual skim.
export const ENTITY_SETTINGS = {
    collection: {
        Icon: DatabaseScript,
        background: semiTransparentBackground_blue,
        bindingTermId: 'terms.collections.plural',
        pluralId: 'terms.collections.plural',
        routes: {
            details: authenticatedRoutes.collections.details.overview.fullPath,
            viewAll: authenticatedRoutes.collections.fullPath,
        },
        termId: 'terms.collections',
    },
    capture: {
        Icon: CloudUpload,
        background: semiTransparentBackground_teal,
        bindingTermId: 'terms.bindings.plural',
        pluralId: 'terms.sources.plural',
        routes: {
            details: authenticatedRoutes.captures.details.overview.fullPath,
            viewAll: authenticatedRoutes.captures.fullPath,
        },
        termId: 'terms.sources',
    },
    materialization: {
        Icon: CloudDownload,
        background: semiTransparentBackground_purple,
        bindingTermId: 'terms.collections.plural',
        pluralId: 'terms.destinations.plural',
        routes: {
            details:
                authenticatedRoutes.materializations.details.overview.fullPath,
            viewAll: authenticatedRoutes.materializations.fullPath,
        },
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
