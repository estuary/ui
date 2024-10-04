import { Buffer } from 'buffer';
import { isArray } from 'lodash';
import { RefreshTokenData } from 'types';

const GIT_REPO = 'https://github.com/estuary/flow-gitpod-base';

// WARNING GitPod can change the URL format at anytime
// https://www.gitpod.io/docs/configure/repositories/environment-variables#providing-one-time-environment-variables-via-the-context-url
//  Last verified Q4 2024
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

    const gitPodURL = `https://gitpod.io/#`;

    const urlVariables = `FLOW_DRAFT_ID=${encodeURIComponent(
        draftId
    )},FLOW_REFRESH_TOKEN=${encodeURIComponent(
        Buffer.from(JSON.stringify(token)).toString('base64')
    )},FLOW_TEMPLATE_TYPE=${derivationLanguage},FLOW_TEMPLATE_MODE=${
        sourceCollectionCount > 1 ? 'multi' : 'single'
    },FLOW_COLLECTION_NAME=${encodeURIComponent(computedEntityName)}`;

    // Must start with a slash to separate it from the variables
    const gitRepoPath = `/${GIT_REPO}`;

    return `${gitPodURL}${urlVariables}${gitRepoPath}`;
};
