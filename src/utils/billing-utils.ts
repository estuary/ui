import { isEqual, parseISO } from 'date-fns';
import { isEmpty, sum } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { BillingRecord } from 'stores/Billing/types';
import { CatalogStats_Billing, Entity } from 'types';

export const TOTAL_CARD_HEIGHT = 300;

// Grid item height - 72 = graph canvas height
export const CARD_AREA_HEIGHT = TOTAL_CARD_HEIGHT - 72;

export const BYTES_PER_GB = 1073741824;

const FREE_TASK_COUNT = 2;

export enum FREE_GB_BY_TIER {
    FREE = 20,
    PERSONAL = 10,
    ENTERPRISE = 10,
}

export const evaluateSpecType = (query: CatalogStats_Billing): Entity => {
    if (Object.hasOwn(query.flow_document.taskStats, 'capture')) {
        return 'capture';
    } else if (Object.hasOwn(query.flow_document.taskStats, 'materialize')) {
        return 'materialization';
    } else {
        return 'collection';
    }
};

const evaluateTotalCost = (dataVolume: number, taskCount: number) => {
    const freeBytes = 10 * BYTES_PER_GB;

    const dataVolumeOverLimit =
        dataVolume > freeBytes ? dataVolume - freeBytes : 0;

    const taskCountOverLimit =
        taskCount > FREE_TASK_COUNT ? taskCount - FREE_TASK_COUNT : 0;

    return (
        (dataVolumeOverLimit / BYTES_PER_GB) * 0.75 + taskCountOverLimit * 20
    );
};

const evaluateDataVolume = (stats: CatalogStats_Billing[]): number => {
    const taskBytes: number[] = stats.map((query) => {
        if (Object.hasOwn(query.flow_document.taskStats, 'capture')) {
            return query.bytes_written_by_me;
        } else if (
            Object.hasOwn(query.flow_document.taskStats, 'materialize')
        ) {
            return query.bytes_read_by_me;
        } else {
            return query.bytes_written_by_me + query.bytes_read_by_me;
        }
    });

    return sum(taskBytes);
};

export const stripTimeFromDate = (date: string) => {
    const [truncatedDateStr] = date.split('T', 1);

    return parseISO(truncatedDateStr);
};

const getInitialBillingRecord = (date: string): BillingRecord => {
    const truncatedDate = stripTimeFromDate(date);

    return {
        date: truncatedDate,
        dataVolume: 0,
        taskCount: 0,
        totalCost: 0,
        pricingTier: null,
        taskRate: null,
        gbFree: null,
        includedTasks: null,
    };
};

// TODO (billing): Remove this helper function to translate data returned from
//   the new RPC when available.
export const formatBillingCatalogStats = (
    value: CatalogStats_Billing[]
): BillingRecord[] => {
    const taskStatData = value.filter((query) =>
        Object.hasOwn(query.flow_document, 'taskStats')
    );

    let sortedStats: {
        [date: string]: CatalogStats_Billing[];
    } = {};

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
                const { date, pricingTier, taskRate, gbFree, includedTasks } =
                    getInitialBillingRecord(ts);

                billingHistory.push({
                    date,
                    dataVolume,
                    taskCount,
                    totalCost,
                    pricingTier: pricingTier ?? 'personal',
                    taskRate: taskRate ?? 20,
                    gbFree: gbFree ?? FREE_GB_BY_TIER.PERSONAL,
                    includedTasks: includedTasks ?? 2,
                });
            } else {
                const { date, pricingTier, taskRate, gbFree, includedTasks } =
                    billingHistory[billingRecordIndex];

                billingHistory[billingRecordIndex] = {
                    date,
                    dataVolume,
                    taskCount,
                    totalCost,
                    pricingTier: pricingTier ?? 'personal',
                    taskRate: taskRate ?? 20,
                    gbFree: gbFree ?? FREE_GB_BY_TIER.PERSONAL,
                    includedTasks: includedTasks ?? 2,
                };
            }
        });
    }

    return billingHistory;
};

export interface SeriesConfig {
    data: [string, number][];
    seriesName?: string;
    stack?: string;
}

export const formatDataVolumeForDisplay = (
    seriesConfigs: SeriesConfig[],
    tooltipConfig: any
): string => {
    const filteredSeries =
        seriesConfigs.length === 1
            ? seriesConfigs
            : seriesConfigs.filter(
                  (series) => series.seriesName === tooltipConfig.seriesName
              );

    const dataVolumeInBytes = filteredSeries
        .flatMap(({ data }) => data)
        .find(([month]) => month === tooltipConfig.name);

    return dataVolumeInBytes
        ? prettyBytes(dataVolumeInBytes[1], { minimumFractionDigits: 2 })
        : `${tooltipConfig.value[1]} GB`;
};
