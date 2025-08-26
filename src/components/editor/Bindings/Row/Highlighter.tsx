import type { HighlighterProps } from 'src/components/editor/Bindings/Row/types';

import { HIGHLIGHT_CLASS_NAME } from 'src/components/editor/Bindings/Row/shared';

function Highlighter({ chunks, output }: HighlighterProps) {
    if (chunks.length === 0) {
        return <span>{output}</span>;
    }

    return (
        <span>
            {chunks.map((chunk, index) => {
                const outputChunk = output.substr(
                    chunk.start,
                    chunk.end - chunk.start
                );
                const key = `hl__${index}`;

                if (chunk.highlight) {
                    return (
                        <mark key={key} className={HIGHLIGHT_CLASS_NAME}>
                            {outputChunk}
                        </mark>
                    );
                }

                return <span key={key}>{outputChunk}</span>;
            })}
        </span>
    );
}

export default Highlighter;
