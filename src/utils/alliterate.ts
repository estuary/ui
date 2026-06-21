import library from 'src/utils/alliterate-library.json';

interface Words {
    modifiers: Record<string, string[]>;
    objects: Record<string, string[]>;
}

const words = library as Words;

// Letters that have both a modifier and an object, so a pair can be formed.
const LETTERS = Object.keys(words.objects).filter(
    (letter) => words.modifiers[letter]?.length && words.objects[letter]?.length
);

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickPair(): [string, string] {
    const letter = randomItem(LETTERS);
    return [
        randomItem(words.modifiers[letter]),
        randomItem(words.objects[letter]),
    ];
}

// e.g. "frolicking ferret"
export function generatePair(): string {
    const [modifier, object] = pickPair();
    return `${modifier} ${object}`;
}

// A catalog-name-safe alliterative slug, e.g. "frolicking-ferret".
export function generateAlliterativeName(): string {
    const [modifier, object] = pickPair();
    return `${modifier}-${object}`;
}
