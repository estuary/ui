import { parseISO } from 'date-fns';
import prettyBytes from 'pretty-bytes';
import { CatalogStats_Billing, Entity, Schema } from 'types';

export const TOTAL_CARD_HEIGHT = 450;

// Grid item height - 72 = graph canvas height
export const CARD_AREA_HEIGHT = TOTAL_CARD_HEIGHT - 72;

export const BYTES_PER_GB = 1073741824;

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

export const stripTimeFromDate = (date: string) => {
    const [truncatedDateStr] = date.split('T', 1);

    return parseISO(truncatedDateStr);
};

export enum SeriesNames {
    INCLUDED = 'Included',
    SURPLUS = 'Billed',
}

export interface SeriesConfig extends Schema {
    data: [string, number][];
    connectNulls?: boolean;
    name?: string;
    seriesName?: string;
    stack?: string;
    type?: string;
    yAxisIndex?: number;
    smooth?: boolean;
}

export const formatDataVolumeForDisplay = (
    seriesConfigs: SeriesConfig[],
    tooltipConfig: any,
    dataVolumeInBytes?: boolean
): string => {
    const filteredSeries =
        seriesConfigs.length === 1
            ? seriesConfigs
            : seriesConfigs.filter(
                  (series) => series.seriesName === tooltipConfig.seriesName
              );

    const config = filteredSeries
        .flatMap(({ data }) => data)
        .find(([month]) => month === tooltipConfig.name);

    if (config) {
        return dataVolumeInBytes
            ? prettyBytes(config[1], {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : `${config[1].toFixed(2)} GB`;
    } else {
        return `${tooltipConfig.value[1]} GB`;
    }
};
