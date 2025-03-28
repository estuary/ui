import {
    DataByHourRange,
    DataByHourStatType,
} from 'src/components/graphs/types';

export interface DetailsUsageState {
    range: DataByHourRange;
    setRange: (val: DataByHourRange) => void;
    statType: DataByHourStatType;
    setStatType: (val: DataByHourStatType) => void;
}
