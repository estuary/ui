import { DataByHourRange, DataByHourStatType } from 'components/graphs/types';
import { RangeSettings } from 'services/luxon';

export interface DetailsUsageState {
    range: RangeSettings;
    setRange: (val: DataByHourRange) => void;
    statType: DataByHourStatType;
    setStatType: (val: DataByHourStatType) => void;
}
