export function isChildOfRoot(value: string, roots: string[]) {
    if (roots.length === 0) return true;

    const matchesRoot = roots.some(
        (prefix) => prefix.startsWith(value) || value.startsWith(prefix)
    );

    const errorMessage =
        roots.length === 1
            ? `Must start with ${roots[0]}`
            : `Must start with one of: ${roots.join(', ')}`;

    return matchesRoot || errorMessage;
}
