import type { DataFlowNodeKind } from 'src/components/shared/Entity/Details/DataFlow/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export interface ModelFacts {
    // e.g. `source-postgres:v5`, `Dekaf (generic)`, `SQLite`
    connector: string | null;
    bindings: { enabled: number; disabled: number } | null;
    key: string[] | null;
    sourceCapture: string | null;
}

const RUNTIMES: Record<string, string> = {
    sqlite: 'SQLite',
    typescript: 'TypeScript',
    python: 'Python',
};

const connectorOf = (
    kind: DataFlowNodeKind,
    model: Record<string, unknown>
): string | null => {
    if (kind === 'derivation') {
        const using = isRecord(model.derive) ? model.derive.using : null;
        const runtime = isRecord(using) ? Object.keys(using)[0] : undefined;

        return runtime ? (RUNTIMES[runtime] ?? runtime) : null;
    }

    const { endpoint } = model;
    if (!isRecord(endpoint)) {
        return null;
    }

    if (isRecord(endpoint.connector)) {
        const { image } = endpoint.connector;

        // Drop the registry path; the image name and tag are what people
        // recognise.
        return typeof image === 'string'
            ? (image.split('/').pop() ?? image)
            : null;
    }

    if (isRecord(endpoint.dekaf)) {
        const { variant } = endpoint.dekaf;
        return typeof variant === 'string' ? `Dekaf (${variant})` : 'Dekaf';
    }

    if (isRecord(endpoint.local)) {
        return 'Local';
    }

    return null;
};

// Reads the few model fields the side panel shows. Defensive throughout:
// models are user-authored JSON and older specs may lack fields.
export const getModelFacts = (
    kind: DataFlowNodeKind,
    model: unknown
): ModelFacts => {
    if (!isRecord(model)) {
        return {
            connector: null,
            bindings: null,
            key: null,
            sourceCapture: null,
        };
    }

    const isTask = kind === 'capture' || kind === 'materialization';
    const bindings =
        isTask && Array.isArray(model.bindings) ? model.bindings : null;
    const disabled =
        bindings?.filter(
            (binding) => isRecord(binding) && binding.disable === true
        ).length ?? 0;

    const { sourceCapture } = model;

    return {
        connector: connectorOf(kind, model),
        bindings: bindings
            ? { enabled: bindings.length - disabled, disabled }
            : null,
        key:
            !isTask && Array.isArray(model.key)
                ? model.key.filter(
                      (ptr): ptr is string => typeof ptr === 'string'
                  )
                : null,
        sourceCapture:
            kind !== 'materialization'
                ? null
                : typeof sourceCapture === 'string'
                  ? sourceCapture
                  : isRecord(sourceCapture) &&
                      typeof sourceCapture.capture === 'string'
                    ? sourceCapture.capture
                    : null,
    };
};

// `shard_failed` -> `Shard failed`
export const formatAlertType = (alertType: string) => {
    const words = alertType.split('_').join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
};
