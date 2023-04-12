import { parseISO } from 'date-fns';
import { sum } from 'lodash';
import prettyBytes from 'pretty-bytes';
import { BillingDetails } from 'stores/Tables/Billing/types';
import { Entity, ProjectedCostStats } from 'types';

export const TOTAL_CARD_HEIGHT = 300;

// Grid item height - 72 = graph canvas height
export const CARD_AREA_HEIGHT = TOTAL_CARD_HEIGHT - 72;

export const BYTES_PER_GB = 1073741824;

const FREE_BYTES = 21474836480;
const FREE_TASK_COUNT = 2;

export const evaluateSpecType = (query: ProjectedCostStats): Entity => {
    if (Object.hasOwn(query.flow_document.taskStats, 'capture')) {
        return 'capture';
    } else if (Object.hasOwn(query.flow_document.taskStats, 'materialize')) {
        return 'materialization';
    } else {
        return 'collection';
    }
};

export const evaluateTotalCost = (dataVolume: number, taskCount: number) => {
    const dataVolumeOverLimit =
        dataVolume > FREE_BYTES ? dataVolume - FREE_BYTES : 0;

    const taskCountOverLimit =
        taskCount > FREE_TASK_COUNT ? taskCount - FREE_TASK_COUNT : 0;

    return (
        (dataVolumeOverLimit / BYTES_PER_GB) * 0.75 + taskCountOverLimit * 20
    );
};

export const evaluateDataVolume = (
    projectedCostStats: ProjectedCostStats[]
): number => {
    const taskBytes: number[] = projectedCostStats.map((query) => {
        if (Object.hasOwn(query.flow_document.taskStats, 'capture')) {
            return query.bytes_written_by_me;
        } else if (
            Object.hasOwn(query.flow_document.taskStats, 'materialize')
        ) {
            return query.bytes_read_by_me;
        } else {
            console.log('Derivation skipped');

            return 0;
        }
    });

    return sum(taskBytes);
};

export const stripTimeFromDate = (date: string) => {
    const [truncatedDateStr] = date.split('T', 1);

    return parseISO(truncatedDateStr);
};

export const getInitialBillingDetails = (date: string): BillingDetails => {
    const truncatedDate = stripTimeFromDate(date);

    return {
        date: truncatedDate,
        month: truncatedDate.getMonth() + 1,
        year: truncatedDate.getFullYear(),
        dataVolume: 0,
        taskCount: 0,
        details: null,
        totalCost: 0,
    };
};

export interface SeriesConfig {
    data: [string, number][];
    seriesName?: string;
}

export const formatDataVolumeForDisplay = (
    seriesConfigs: SeriesConfig[],
    tooltipConfig: any
): string => {
    const selectedSeries =
        seriesConfigs.length === 1
            ? seriesConfigs[0]
            : seriesConfigs.find(
                  (series) => series.seriesName === tooltipConfig.seriesName
              );

    const dataVolumeInBytes = selectedSeries?.data.find(
        ([month]) => month === tooltipConfig.name
    );

    return dataVolumeInBytes
        ? prettyBytes(dataVolumeInBytes[1], { minimumFractionDigits: 2 })
        : `${tooltipConfig.value[1]} GB`;
};
