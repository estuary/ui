import prettyBytes from 'pretty-bytes';

export const BYTES_PER_GB = 1073741824;

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
        ? prettyBytes(dataVolumeInBytes[1])
        : `${tooltipConfig.value[1]} GB`;
};
