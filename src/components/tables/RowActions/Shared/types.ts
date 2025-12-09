import type { ReactNode } from 'react';
import type { CaptureQuery } from 'src/api/liveSpecsExt';
import type { AccessGrantRowConfirmation } from 'src/components/tables/RowActions/AccessGrants/types';
import type {
    RowActionSupportedTableStoreName,
    RowConfirmation,
} from 'src/components/tables/RowActions/types';
import type { TableActionSettings } from 'src/stores/Tables/Store';
import type { LiveSpecsExtBaseQuery } from 'src/types';

export const ProgressFinished = 60;

// These go up by 20s so there is room to inject more states if needed
export enum ProgressStates {
    IDLE = -20, // Currently only used by Prompt Steps
    PAUSED = 0, // Unused
    RUNNING = 20,
    RETRYING = 40, // Unused

    // Make sure this stays in sync with ProgressFinished
    SKIPPED = 60,
    SUCCESS = 80,
    FAILED = 100,
}

export interface SharedProgressProps {
    name: string;
    error: any | null;
    runningIntlKey: string;
    successIntlKey: string;
    titleIntlKey: string;
    state: ProgressStates;
    logToken?: string | null;
    renderBody?: (progressState: ProgressStates) => ReactNode;
    renderError?: (error: any, progressState: ProgressStates) => ReactNode;
    renderLogs?: Function | boolean;
    skippedIntlKey?: string;
    groupedEntities?: LiveSpecsExtBaseQuery[];
}

export interface ConfirmationAlertProps {
    messageId: string;
    potentiallyDangerousUpdate?: boolean;
}

export interface SettingMetadata {
    messageId: string;
    setting: keyof TableActionSettings;
}

export interface NestedListItemProps {
    catalogName: string;
    selectableTableStoreName: RowActionSupportedTableStoreName;
    settings: SettingMetadata[];
}

export interface RowActionConfirmationProps {
    message: any;
    selected: string[] | RowConfirmation[]; //SelectableTableStore['selected'];
    selectableTableStoreName?: RowActionSupportedTableStoreName;
    settings?: SettingMetadata[];
    detailTable?: boolean;
}

export interface RowActionButtonProps {
    messageID: string;
    renderConfirmationMessage: (selectedNames: string[]) => ReactNode;
    renderProgress: (
        item: any,
        index: number,
        onFinish: (response: any) => void
    ) => ReactNode;
    selectableTableStoreName: RowActionSupportedTableStoreName;
}

export interface GroupedRowActionButtonProps {
    messageIntlKey: string;
    renderConfirmationMessage: (selectedNames: string[]) => ReactNode;
    renderProgress: (
        items: CaptureQuery[],
        onFinish: (response: any) => void
    ) => ReactNode;
    selectableTableStoreName: RowActionSupportedTableStoreName;
}

// Mainly for Access Grants and Data Sharing
export interface ConfirmationWithExplanationProps {
    message: string | ReactNode;
    selected: AccessGrantRowConfirmation[];
}
