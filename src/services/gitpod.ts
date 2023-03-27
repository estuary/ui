// TODO: Change this to master when the PR gets merged
const GIT_REPO =
    'https://github.com/estuary/flow-gitpod-base/tree/jshearer/getting_started';

export const generateGitPodURL = (
    draftId: string,
    token: any,
    derivationLanguage: string,
    selectedCollectionSet: any,
    computedEntityName: string
) => {
    return `https://gitpod.io/#FLOW_DRAFT_ID=${encodeURIComponent(
        draftId
    )},FLOW_REFRESH_TOKEN=${encodeURIComponent(
        Buffer.from(JSON.stringify(token.body)).toString('base64')
    )},FLOW_TEMPLATE_TYPE=${derivationLanguage},FLOW_TEMPLATE_MODE=${
        selectedCollectionSet.size > 1 ? 'multi' : 'single'
    },FLOW_COLLECTION_NAME=${encodeURIComponent(
        computedEntityName
    )}/${GIT_REPO}`;
};
