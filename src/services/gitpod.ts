import { Buffer } from 'buffer';
import type { RefreshTokenData } from 'src/types';

import { isArray } from 'lodash';

const GIT_POD_URL = `https://gitpod.io/#`;
const GIT_REPO = 'https://github.com/estuary/flow-gitpod-base';
const GIT_REPO_PATH = `/${GIT_REPO}`; // Must start with a slash to separate it from the variables

// WARNING GitPod can change the URL format at anytime
// https://www.gitpod.io/docs/classic/user/configure/workspaces/environment-variables#one-time-environment-variables-via-context-url
//  Last verified Q3 2025
export const generateGitPodURL = (
    draftId: string,
    token: RefreshTokenData,
    derivationLanguage: string,
    sourceCollections: Set<string> | string[],
    computedEntityName: string
) => {
    const sourceCollectionCount = isArray(sourceCollections)
        ? sourceCollections.length
        : sourceCollections.size;

    // https://github.com/estuary/flow-gitpod-base/blob/main/init.sh
    // This object is consumed by GitPod init.sh and has to stay in sync
    const settingsPart = `FLOW_SETTINGS=${encodeURIComponent(
        Buffer.from(
            JSON.stringify({
                id: draftId,
                rt: token,

                // TODO - (GitPod) These all seem unused in the script but need to double check
                dl: derivationLanguage,
                tt: sourceCollectionCount > 1 ? 'multi' : 'single',
                cn: computedEntityName,
            })
        ).toString('base64')
    )}`;

    return `${GIT_POD_URL}${settingsPart}${GIT_REPO_PATH}`;
};
