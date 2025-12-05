import type { PostgrestError } from '@supabase/postgrest-js';
import type { Dispatch, SetStateAction } from 'react';

export interface GenerateInvitationProps {
    serverError: PostgrestError | null;
    setServerError: React.Dispatch<React.SetStateAction<PostgrestError | null>>;
}

export interface PrefixInvitationDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}
