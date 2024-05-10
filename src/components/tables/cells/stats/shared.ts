import prettyBytes from 'pretty-bytes';
import readable from 'readable-numbers';

export const formatBytes = (val: any) =>
    prettyBytes(val ?? 0, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export const formatDocs = (val: any) => readable(val ?? 0, 2, false);
