import type { CustomCell } from "@bytecat/glide-data-grid";

interface ArticleCellProps {
    readonly kind: "article-cell";
    readonly markdown: string;
}

export type ArticleCell = CustomCell<ArticleCellProps>;
