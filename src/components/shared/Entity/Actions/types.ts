import type { CustomEvents } from 'src/services/types';

export interface EntityTestButtonProps {
    disabled: boolean;
    logEvent: CustomEvents.CAPTURE_TEST | CustomEvents.MATERIALIZATION_TEST;
}

export interface EntitySaveButtonProps {
    logEvent:
        | CustomEvents.CAPTURE_CREATE
        | CustomEvents.COLLECTION_CREATE
        | CustomEvents.MATERIALIZATION_CREATE
        | CustomEvents.CAPTURE_EDIT
        | CustomEvents.MATERIALIZATION_EDIT;
    disabled?: boolean;
}

export interface EntityCreateSaveButtonProps {
    disabled: boolean;
    loading: boolean;
    logEvent: CustomEvents;
    onFailure: Function;
    buttonLabelId?: string;
    dryRun?: boolean;
}
