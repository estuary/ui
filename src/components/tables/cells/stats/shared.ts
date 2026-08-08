import prettyBytes from 'pretty-bytes';
import readable from 'readable-numbers';

// TODO: Move formatBytes into the utils directory since it is widely used
//   and replace applicable independent instances of prettyBytes.
export const formatBytes = (val: any, fractionDigits = 2) =>
    prettyBytes(val ?? 0, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });

export const formatDocs = (val: any) => readable(val ?? 0, 2, false);
