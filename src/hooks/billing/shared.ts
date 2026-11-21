import type { CombinedError } from 'urql';

// A null tenant means the read failed or the caller can't see the tenant, not
// that its billing is empty. The cache returns that without the read's error.
// A failed read's data can hold nulls the schema rules out, so only a read
// that succeeded yields billing.
export function readBilling<Billing>(
    tenant: string,
    data: { tenant?: { billing: Billing } | null } | null | undefined,
    error: CombinedError | undefined
) {
    const failed =
        error ??
        (data !== undefined && !data?.tenant
            ? new Error(`Unable to load billing for ${tenant}`)
            : undefined);

    return {
        billing: failed ? undefined : data?.tenant?.billing,
        error: failed,
    };
}
