import { Buffer } from 'buffer';
import type { RefreshTokenData } from 'src/types';

const GIT_POD_URL = `https://gitpod.io/#`;
const GIT_REPO = 'https://github.com/estuary/flow-gitpod-base';
const GIT_REPO_PATH = `/${GIT_REPO}`; // Must start with a slash to separate it from the variables

// WARNING GitPod can change the URL format at anytime
// https://www.gitpod.io/docs/classic/user/configure/workspaces/environment-variables#one-time-environment-variables-via-context-url
//  Last verified Q3 2025
export const generateGitPodURL = (
    draftId: string,
    token: RefreshTokenData,
    computedEntityName: string
) => {
    // https://github.com/estuary/flow-gitpod-base/blob/main/init.sh
    // This object is consumed by GitPod init.sh and has to stay in sync
    const settingsPart = `F_S=${encodeURIComponent(
        Buffer.from(
            JSON.stringify({
                id: draftId,
                rt: token,
            })
        ).toString('base64')
    )}`;

    // Adding a bit of unique value here - this is not consumed by the workspace
    const uniqueProps = `ENTITY=${encodeURIComponent(computedEntityName)}`;

    return `${GIT_POD_URL}${uniqueProps},${settingsPart}${GIT_REPO_PATH}`;
};
