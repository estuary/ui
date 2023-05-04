import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import useDraftSpecErrors from 'hooks/useDraftSpecErrors';

export interface DraftErrorProps {
    draftId?: string | null;
    enablePolling?: boolean;
}

function DraftErrors({ draftId, enablePolling }: DraftErrorProps) {
    const { draftSpecErrors } = useDraftSpecErrors(draftId, enablePolling);

    if (draftSpecErrors.length > 0) {
        const errors: KeyValue[] = draftSpecErrors.map((draftError) => {
            // TODO(johnny): Could we use a breadcrumb presentation here?
            // 1) Remove file:///flow.json# prefix if present.
            // 2) Split on '/'. Each component is a breadcrumb.
            // 3) Replace ~1 => '/' for each item.
            // 4) Replace ~0 => '~' for each item.
            const scope = draftError.scope
                // Strip the canonical source file used by control-plane builds.
                // It's not user-defined and thus not useful to the user.
                .replace('file:///flow.json#', '')
                // Remove JSON pointer escapes. The result is not technically a JSON pointer,
                // but it's far more legible.
                .replaceAll('~1', '/')
                .replaceAll('~0', '~');

            // TODO(johnny): Can we turn newlines into proper breaks?
            const detail = draftError.detail;

            return {
                title: detail,
                val: scope,
            };
        });
        return <KeyValueList data={errors} />;
    } else {
        return null;
    }
}

export default DraftErrors;
