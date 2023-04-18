import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { isEqual } from 'date-fns';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { isEmpty } from 'lodash';
import {
    BillingRecord,
    ProjectedCostStatsDictionary,
} from 'stores/Tables/Billing/types';
import { ProjectedCostStats } from 'types';
import {
    evaluateDataVolume,
    evaluateTotalCost,
    FREE_GB_BY_TIER,
    getInitialBillingRecord,
    stripTimeFromDate,
} from 'utils/billing-utils';
import { hasLength } from 'utils/misc-utils';

interface Props {
    query: PostgrestFilterBuilder<ProjectedCostStats>;
}

const INTERVAL = 30000;

const defaultResponse: BillingRecord[] = [];

// TODO (billing): Remove this helper function to translate data returned from
//   the new RPC when available.
const formatProjectedCostStats = (
    value: ProjectedCostStats[]
): BillingRecord[] => {
    const taskStatData = value.filter((query) =>
        Object.hasOwn(query.flow_document, 'taskStats')
    );

    let sortedStats: ProjectedCostStatsDictionary = {};

    taskStatData.forEach((query) => {
        if (Object.hasOwn(sortedStats, query.ts)) {
            sortedStats[query.ts].push(query);
        } else {
            sortedStats = {
                ...sortedStats,
                [query.ts]: [query],
            };
        }
    });

    const billingHistory: BillingRecord[] = [];

    if (!isEmpty(sortedStats)) {
        Object.entries(sortedStats).forEach(([ts, stats]) => {
            const billingRecordIndex = billingHistory.findIndex((record) =>
                isEqual(record.date, stripTimeFromDate(ts))
            );

            const taskCount = stats.length;
            const dataVolume = evaluateDataVolume(stats);
            const totalCost = evaluateTotalCost(dataVolume, taskCount);

            if (billingRecordIndex === -1) {
                const { date, pricingTier, taskRate, gbFree } =
                    getInitialBillingRecord(ts);

                billingHistory.push({
                    date,
                    dataVolume,
                    taskCount,
                    totalCost,
                    pricingTier: pricingTier ?? 'personal',
                    taskRate: taskRate ?? 20,
                    gbFree: gbFree ?? FREE_GB_BY_TIER.PERSONAL,
                });
            } else {
                const { date, pricingTier, taskRate, gbFree } =
                    billingHistory[billingRecordIndex];

                billingHistory[billingRecordIndex] = {
                    date,
                    dataVolume,
                    taskCount,
                    totalCost,
                    pricingTier: pricingTier ?? 'personal',
                    taskRate: taskRate ?? 20,
                    gbFree: gbFree ?? FREE_GB_BY_TIER.PERSONAL,
                };
            }
        });
    }

    return billingHistory;
};

function useBillingHistory({ query }: Props) {
    const { combinedGrants } = useCombinedGrantsExt({ adminOnly: true });

    const { data, error, mutate, isValidating } =
        useSelectNew<ProjectedCostStats>(
            hasLength(combinedGrants) ? query : null,
            {
                errorRetryCount: 3,
                errorRetryInterval: INTERVAL / 2,
                refreshInterval: INTERVAL,
                revalidateOnFocus: false,
            }
        );

    return {
        billingHistory: data
            ? formatProjectedCostStats(data.data)
            : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useBillingHistory;
