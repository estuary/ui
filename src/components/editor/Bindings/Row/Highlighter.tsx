import type { HighlighterProps } from 'src/components/editor/Bindings/Row/types';

import { HIGHLIGHT_CLASS_NAME } from 'src/components/editor/Bindings/Row/shared';

function Highlighter({ chunks, output }: HighlighterProps) {
    if (chunks.length === 0) {
        return <span>{output}</span>;
    }

    return (
        <span>
            {chunks.map((chunk, index) => {
                return (
                    <span
                        className={
                            chunk.highlight ? HIGHLIGHT_CLASS_NAME : undefined
                        }
                        key={`hl__${index}`}
                    >
                        {output.substr(chunk.start, chunk.end - chunk.start)}
                    </span>
                );
            })}
        </span>
    );
}

export default Highlighter;
