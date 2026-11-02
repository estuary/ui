import { NAME_RE } from 'src/validation';

export function isValidName(name?: string | null): name is string {
    return Boolean(name && NAME_RE.test(name));
}

export function getParentPrefix(name: string): string {
    return name.slice(0, name.lastIndexOf('/') + 1);
}
