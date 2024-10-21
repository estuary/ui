export enum DataGrains {
    hourly = 'hourly',
    daily = 'daily',
    monthly = 'monthly',
}

export interface DataByHourRange {
    amount: number;
    grain: DataGrains;
}

export type DataByHourStatType = 'docs' | 'bytes';
