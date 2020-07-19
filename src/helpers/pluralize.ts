/**
 * Returns the plural form of a word.
 *
 * If it's too far off norms, it will deliberately be wrong e.g. `goose -> gooses`.
 *
 * If not a string will return `''`.
 * @param word Word to get its plural form.
 */
export function pluralize(word: string): string {
  if (!word || typeof word !== 'string') return '';

  const { ifEndsWith, ifIsIn } = helpersFor(word);

  return (
    ifEndsWith('ex').replace('ices') ||
    ifEndsWith('us').replace('i') ||
    ifEndsWith('oof').concat('s') ||
    ifEndsWith('f').replace('ves') ||
    ifEndsWith('fe').replace('ves') ||
    ifEndsWith('is').replace('es') ||
    ifEndsWith('um').replace('a') ||
    ifIsIn(oExceptions).concat('es') ||
    ifEndsWith('ay', 'ey', 'iy', 'oy', 'uy').concat('s') ||
    ifEndsWith('y').replace('ies') ||
    ifEndsWith('craft').keep() ||
    ifEndsWith('ch', 'sh', 's', 'x', 'z').concat('es') ||
    word + 's'
  );
}

function helpersFor(word: string) {
  word = word.trim().toLowerCase();

  const concat = (chars: string) => word + chars;
  const end = () => null;
  const keep = () => word;

  const ifEndsWith = (...chars: string[]) => {
    const char = chars.find((c) => word.endsWith(c));

    if (!char) return { concat: end, keep: end, replace: end };

    const replace = (value: string) => word.slice(0, -char.length) + value;

    return { concat, keep, replace };
  };

  const ifIsIn = (words: string[]) =>
    words.includes(word) ? { concat } : { concat: end };

  return { ifEndsWith, ifIsIn };
}

const oExceptions = [
  'echo',
  'embargo',
  'hero',
  'potato',
  'tomato',
  'veto',
  'volcano',
];
