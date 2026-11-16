import { NAME_RE } from 'src/validation';

export function isValidName(name?: string | null): name is string {
    return Boolean(name && NAME_RE.test(name));
}

export function getParentPrefix(name: string): string {
    return name.slice(0, name.lastIndexOf('/') + 1);
}

export function getCleanCatalogNames(catalogNames: string | string[]) {
    const names: string[] = Array.isArray(catalogNames)
        ? catalogNames
        : [catalogNames];

    // remove empty/falsey and dedupe
    return [...new Set(names.filter(Boolean))];
}
