import { Buffer } from 'buffer';
import { isArray } from 'lodash';

const GIT_REPO = 'https://github.com/estuary/flow-gitpod-base';

export const generateGitPodURL = (
    draftId: string,
    token: any,
    derivationLanguage: string,
    sourceCollections: Set<string> | string[],
    computedEntityName: string
) => {
    const sourceCollectionCount = isArray(sourceCollections)
        ? sourceCollections.length
        : sourceCollections.size;

    return `https://gitpod.io/#FLOW_DRAFT_ID=${encodeURIComponent(
        draftId
    )},FLOW_REFRESH_TOKEN=${encodeURIComponent(
        Buffer.from(JSON.stringify(token.body)).toString('base64')
    )},FLOW_TEMPLATE_TYPE=${derivationLanguage},FLOW_TEMPLATE_MODE=${
        sourceCollectionCount > 1 ? 'multi' : 'single'
    },FLOW_COLLECTION_NAME=${encodeURIComponent(
        computedEntityName
    )}/${GIT_REPO}`;
};
