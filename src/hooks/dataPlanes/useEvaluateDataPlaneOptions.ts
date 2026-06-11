import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import { useCallback } from 'react';

import { uniq } from 'lodash';
import { useClient } from 'urql';

import { DATA_PLANES_QUERY, toDataPlaneNode } from 'src/api/gql/dataPlanes';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import {
    generateDataPlaneOption,
    getDataPlaneInfo,
} from 'src/utils/dataPlane-utils';
import { defaultDataPlaneSuffix } from 'src/utils/env-utils';

const toBaseDataPlaneQuery = (node: DataPlaneNode) => ({
    data_plane_name: node.name,
    id: node.name,
    reactor_address: node.reactorAddress,
    cidr_blocks: node.cidrBlocks,
    gcp_service_account_email: node.gcpServiceAccountEmail,
    aws_iam_user_arn: node.awsIamUserArn,
    data_plane_fqdn: node.fqdn,
});

export const useEvaluateDataPlaneOptions = () => {
    const client = useClient();

    const setDataPlaneOptions = useDetailsFormStore(
        (state) => state.setDataPlaneOptions
    );
    const setExistingDataPlaneOption = useDetailsFormStore(
        (state) => state.setExistingDataPlaneOption
    );

    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    const setStorageMappingPrefix = useWorkflowStore(
        (state) => state.setStorageMappingPrefix
    );

    return useCallback(
        async (
            catalogName?: string,
            existingDataPlane?: {
                name: string | null;
                id: string;
                reactorAddress: string | null;
            }
        ) => {
            // Get required data-plane information from the matched storage mapping.
            const dataPlaneNames = Object.values(storageMappings).flatMap(
                ({ data_planes }) => data_planes
            );

            const {
                dataPlaneNames: matchedDataPlaneNames,
                storageMappingPrefix,
            } = getDataPlaneInfo(storageMappings, catalogName);

            // Add the existing data-plane name to the array of data-plane names of the
            // matched storage mapping in the event it is not there. This data-plane should
            // be treated as the default in edit workflows so it must be the first element
            // in the array of data-plane names.
            let evaluatedDataPlaneNames =
                existingDataPlane?.name &&
                !dataPlaneNames.includes(existingDataPlane.name)
                    ? [existingDataPlane.name].concat(dataPlaneNames)
                    : dataPlaneNames;

            const result = await client
                .query(DATA_PLANES_QUERY, {})
                .toPromise();
            const dataPlanes =
                result.data?.dataPlanes.edges.map((e) =>
                    toDataPlaneNode(e.node)
                ) ?? [];
            const error = result.error;

            // If the array of data-planes does not contain an element with the same name
            // as the existing data-plane, stub the BaseDataPlaneQuery response corresponding
            // to the existing data-plane so it can appear as a data-plane option. This is
            // particularly important for edit workflows.
            if (dataPlanes.length > 0) {
                const queriedDataPlaneNames = dataPlanes
                    .map(({ name }) => name)
                    .filter((name) => !evaluatedDataPlaneNames.includes(name));

                evaluatedDataPlaneNames = [
                    ...evaluatedDataPlaneNames,
                    ...queriedDataPlaneNames,
                ];
            }

            let evaluatedDataPlaneOptions = uniq(evaluatedDataPlaneNames).map(
                (dataPlaneName) => {
                    const matchedPlane = dataPlanes.find(
                        (dp) => dp.name === dataPlaneName
                    );

                    const defaultDataPlaneName = matchedPlane?.name
                        ? matchedPlane.name
                        : hasSupportRole
                          ? `${DATA_PLANE_SETTINGS.public.prefix}${defaultDataPlaneSuffix}`
                          : matchedDataPlaneNames.length > 0
                            ? matchedDataPlaneNames[0]
                            : dataPlaneNames.at(0);

                    return generateDataPlaneOption(
                        matchedPlane
                            ? toBaseDataPlaneQuery(matchedPlane)
                            : {
                                  data_plane_name: dataPlaneName,
                                  id: dataPlaneName,
                                  reactor_address: '',
                                  cidr_blocks: null,
                                  gcp_service_account_email: null,
                                  aws_iam_user_arn: null,
                                  data_plane_fqdn: null,
                              },
                        defaultDataPlaneName
                    );
                }
            );

            if (
                !evaluatedDataPlaneOptions ||
                evaluatedDataPlaneOptions.length === 0 ||
                error
            ) {
                logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
                    noOptionsFound: true,
                    fallbackExists: Boolean(existingDataPlane),
                });

                const stubOption = existingDataPlane
                    ? generateDataPlaneOption(
                          {
                              data_plane_name: existingDataPlane.name ?? '',
                              id: existingDataPlane.id,
                              reactor_address:
                                  existingDataPlane.reactorAddress ?? '',
                              cidr_blocks: null,
                              gcp_service_account_email: null,
                              aws_iam_user_arn: null,
                              data_plane_fqdn: null,
                          },
                          existingDataPlane.name ?? ''
                      )
                    : null;

                const fallbackOptions = stubOption ? [stubOption] : [];

                setDataPlaneOptions(fallbackOptions);

                return fallbackOptions;
            }

            setDataPlaneOptions(evaluatedDataPlaneOptions);
            setExistingDataPlaneOption(
                evaluatedDataPlaneOptions.find(
                    (option) =>
                        option.dataPlaneName.whole === existingDataPlane?.name
                )
            );
            setStorageMappingPrefix(storageMappingPrefix ?? '');

            return evaluatedDataPlaneOptions;
        },
        [
            client,
            hasSupportRole,
            setDataPlaneOptions,
            setExistingDataPlaneOption,
            setStorageMappingPrefix,
            storageMappings,
        ]
    );
};
