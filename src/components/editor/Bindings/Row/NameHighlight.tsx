import type { NameHighlightProps } from 'src/components/editor/Bindings/Row/types';

import { HIGHLIGHT_CLASS_NAME } from 'src/components/editor/Bindings/Row/shared';

export const NameHighlight = ({
    children,
    highlightIndex,
}: NameHighlightProps) => (
    <strong className={HIGHLIGHT_CLASS_NAME}>{children}</strong>
);
