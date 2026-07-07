import React from "react";
import { styled } from "@linaria/react";
import { marked, type Token, type Tokens } from "marked";
import SyntaxHighlighter from "react-syntax-highlighter";
import highlightStyle from "react-syntax-highlighter/dist/esm/styles/hljs/github";

export interface WrapperProps {
    height: number;
}

export const Wrapper = styled.div<WrapperProps>`
    overflow: hidden;
    position: relative;

    border-radius: 12px;

    box-shadow:
        0 2px 5px rgba(0, 0, 0, 0.2),
        0 0 1px rgba(0, 0, 0, 0.4);

    width: 100%;
    height: ${p => p.height}px;

    margin: 24px 0;

    > :first-child {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
`;

export const Highlight: React.FC<{ children: string }> = p => {
    return (
        <SyntaxHighlighter
            style={highlightStyle}
            showLineNumbers={true}
            lineNumberStyle={{ opacity: 0.5 }}
            language="typescript">
            {p.children.trim()}
        </SyntaxHighlighter>
    );
};

const safeUrl = (url: string): string | undefined => {
    const trimmed = url.trim();

    if (
        trimmed.startsWith("#") ||
        trimmed.startsWith("/") ||
        trimmed.startsWith("./") ||
        trimmed.startsWith("../") ||
        /^(https?:|mailto:|tel:)/i.test(trimmed)
    ) {
        return trimmed;
    }

    return undefined;
};

const renderInlineTokens = (tokens: Token[], keyPrefix: string): React.ReactNode[] =>
    tokens.map((token, index) => renderInlineToken(token, `${keyPrefix}-${index}`));

const renderInlineToken = (token: Token, key: React.Key): React.ReactNode => {
    switch (token.type) {
        case "br":
            return <br key={key} />;
        case "codespan":
            return <code key={key}>{token.text}</code>;
        case "del":
            return <del key={key}>{renderInlineTokens(token.tokens, `${key}-del`)}</del>;
        case "em":
            return <em key={key}>{renderInlineTokens(token.tokens, `${key}-em`)}</em>;
        case "escape":
            return <React.Fragment key={key}>{token.text}</React.Fragment>;
        case "html":
            return <React.Fragment key={key}>{token.text}</React.Fragment>;
        case "image": {
            const src = safeUrl(token.href);
            if (src === undefined) return null;
            return <img key={key} src={src} alt={token.text} title={token.title ?? undefined} />;
        }
        case "link": {
            const href = safeUrl(token.href);
            if (href === undefined) {
                return <React.Fragment key={key}>{renderInlineTokens(token.tokens, `${key}-link`)}</React.Fragment>;
            }
            return (
                <a key={key} href={href} title={token.title ?? undefined}>
                    {renderInlineTokens(token.tokens, `${key}-link`)}
                </a>
            );
        }
        case "strong":
            return <strong key={key}>{renderInlineTokens(token.tokens, `${key}-strong`)}</strong>;
        case "text":
            if (token.tokens !== undefined) {
                return <React.Fragment key={key}>{renderInlineTokens(token.tokens, `${key}-text`)}</React.Fragment>;
            }
            return <React.Fragment key={key}>{token.text}</React.Fragment>;
        default:
            if ("tokens" in token && token.tokens !== undefined) {
                return <React.Fragment key={key}>{renderInlineTokens(token.tokens, `${key}-tokens`)}</React.Fragment>;
            }
            return <React.Fragment key={key}>{token.raw}</React.Fragment>;
    }
};

const renderTableCell = (cell: Tokens.TableCell, key: React.Key): React.ReactNode => {
    const style = cell.align === null ? undefined : { textAlign: cell.align };
    const Cell = cell.header ? "th" : "td";

    return (
        <Cell key={key} style={style}>
            {renderInlineTokens(cell.tokens, `${key}-cell`)}
        </Cell>
    );
};

const renderBlockToken = (token: Token, key: React.Key): React.ReactNode => {
    switch (token.type) {
        case "blockquote":
            return <blockquote key={key}>{renderBlockTokens(token.tokens, `${key}-blockquote`)}</blockquote>;
        case "code":
            return (
                <pre key={key}>
                    <code>{token.text}</code>
                </pre>
            );
        case "heading": {
            const Heading = `h${Math.min(Math.max(token.depth, 1), 6)}` as React.ElementType;
            return <Heading key={key}>{renderInlineTokens(token.tokens, `${key}-heading`)}</Heading>;
        }
        case "hr":
            return <hr key={key} />;
        case "html":
            return <React.Fragment key={key}>{token.text}</React.Fragment>;
        case "list": {
            const listToken = token as Tokens.List;
            const List = listToken.ordered ? "ol" : "ul";
            return (
                <List
                    key={key}
                    start={listToken.ordered && typeof listToken.start === "number" ? listToken.start : undefined}>
                    {listToken.items.map((item, index) => (
                        <li key={`${key}-item-${index}`}>{renderBlockTokens(item.tokens, `${key}-item-${index}`)}</li>
                    ))}
                </List>
            );
        }
        case "paragraph":
            return <p key={key}>{renderInlineTokens(token.tokens, `${key}-paragraph`)}</p>;
        case "space":
            return null;
        case "table":
            return (
                <table key={key}>
                    <thead>
                        <tr>{token.header.map((cell, index) => renderTableCell(cell, `${key}-header-${index}`))}</tr>
                    </thead>
                    <tbody>
                        {token.rows.map((row, rowIndex) => (
                            <tr key={`${key}-row-${rowIndex}`}>
                                {row.map((cell, cellIndex) =>
                                    renderTableCell(cell, `${key}-row-${rowIndex}-${cellIndex}`)
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        case "text":
            if (token.tokens !== undefined) {
                return <React.Fragment key={key}>{renderInlineTokens(token.tokens, `${key}-text`)}</React.Fragment>;
            }
            return <React.Fragment key={key}>{token.text}</React.Fragment>;
        default:
            if ("tokens" in token && token.tokens !== undefined) {
                return <React.Fragment key={key}>{renderBlockTokens(token.tokens, `${key}-tokens`)}</React.Fragment>;
            }
            return <React.Fragment key={key}>{token.raw}</React.Fragment>;
    }
};

const renderBlockTokens = (tokens: Token[], keyPrefix: string): React.ReactNode[] =>
    tokens.map((token, index) => renderBlockToken(token, `${keyPrefix}-${index}`));

export const Marked: React.FC<{ children: string }> = p => {
    return <div className="marked">{renderBlockTokens(marked.lexer(p.children), "marked")}</div>;
};

const BeautifulStyle = styled.div`
    background: white;
    color: #222222;

    padding: 32px 48px;

    display: flex;
    align-items: center;
    flex-direction: column;
    min-height: 100vh;

    font-family: sans-serif;

    & .inner {
        position: relative;
        width: 900px;

        > pre {
            font-size: 14px;
            border-radius: 9px;
        }
    }

    .marked {
        font-family: Helvetica, arial, sans-serif;
        font-size: 18px;
        line-height: 1.6;

        > *:first-child {
            margin-top: 0 !important;
        }
        > *:last-child {
            margin-bottom: 0 !important;
        }

        a {
            color: #4183c4;
        }
        a.absent {
            color: #cc0000;
        }
        a.anchor {
            display: block;
            padding-left: 30px;
            margin-left: -30px;
            cursor: pointer;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin: 20px 0 10px;
            padding: 0;
            font-weight: bold;
            -webkit-font-smoothing: antialiased;
            cursor: text;
            position: relative;
        }

        h1:hover a.anchor,
        h2:hover a.anchor,
        h3:hover a.anchor,
        h4:hover a.anchor,
        h5:hover a.anchor,
        h6:hover a.anchor {
            text-decoration: none;
        }

        h1 tt,
        h1 code {
            font-size: inherit;
        }

        h2 tt,
        h2 code {
            font-size: inherit;
        }

        h3 tt,
        h3 code {
            font-size: inherit;
        }

        h4 tt,
        h4 code {
            font-size: inherit;
        }

        h5 tt,
        h5 code {
            font-size: inherit;
        }

        h6 tt,
        h6 code {
            font-size: inherit;
        }

        h1 {
            font-size: 32px;
            color: black;
        }

        h2 {
            font-size: 28px;
            border-bottom: 1px solid #cccccc;
            color: black;
        }

        h3 {
            font-size: 22px;
        }

        h4 {
            font-size: 20px;
        }

        h5 {
            font-size: 18px;
        }

        h6 {
            color: #777777;
            font-size: 18px;
        }

        p,
        blockquote,
        ul,
        ol,
        dl,
        li,
        table,
        pre {
            margin: 20px 0;
        }

        hr {
            border: 0 none;
            color: #cccccc;
            height: 4px;
            padding: 0;
        }

        > h2:first-child {
            margin-top: 0;
            padding-top: 0;
        }
        > h1:first-child {
            margin-top: 0;
            padding-top: 0;
        }
        > h1:first-child + h2 {
            margin-top: 0;
            padding-top: 0;
        }
        > h3:first-child,
        > h4:first-child,
        > h5:first-child,
        > h6:first-child {
            margin-top: 0;
            padding-top: 0;
        }

        a:first-child h1,
        a:first-child h2,
        a:first-child h3,
        a:first-child h4,
        a:first-child h5,
        a:first-child h6 {
            margin-top: 0;
            padding-top: 0;
        }

        h1 p,
        h2 p,
        h3 p,
        h4 p,
        h5 p,
        h6 p {
            margin-top: 0;
        }

        li p.first {
            display: inline-block;
        }
        li {
            margin: 0;
        }
        ul,
        ol {
            padding-left: 30px;
        }

        ul :first-child,
        ol :first-child {
            margin-top: 0;
        }

        dl {
            padding: 0;
        }
        dl dt {
            font-size: 18px;
            font-weight: bold;
            font-style: italic;
            padding: 0;
            margin: 15px 0 5px;
        }
        dl dt:first-child {
            padding: 0;
        }
        dl dt > :first-child {
            margin-top: 0;
        }
        dl dt > :last-child {
            margin-bottom: 0;
        }
        dl dd {
            margin: 0 0 15px;
            padding: 0 15px;
        }
        dl dd > :first-child {
            margin-top: 0;
        }
        dl dd > :last-child {
            margin-bottom: 0;
        }

        blockquote {
            border-left: 4px solid #dddddd;
            padding: 0 15px;
            color: #777777;
        }
        blockquote > :first-child {
            margin-top: 0;
        }
        blockquote > :last-child {
            margin-bottom: 0;
        }

        table {
            font-size: 14px;
            padding: 0;
            border-collapse: collapse;
        }
        table tr {
            border-top: 1px solid #cccccc;
            background-color: white;
            margin: 0;
            padding: 0;
        }
        table tr:nth-child(2n) {
            background-color: #f8f8f8;
        }
        table tr th {
            font-weight: bold;
            border: 1px solid #cccccc;
            margin: 0;
            padding: 6px 13px;
        }
        table tr td {
            border: 1px solid #cccccc;
            margin: 0;
            padding: 6px 13px;
        }
        table tr th :first-child,
        table tr td :first-child {
            margin-top: 0;
        }
        table tr th :last-child,
        table tr td :last-child {
            margin-bottom: 0;
        }

        img {
            max-width: 100%;
        }

        span.frame {
            display: block;
            overflow: hidden;
        }
        span.frame > span {
            border: 1px solid #dddddd;
            display: block;
            float: left;
            overflow: hidden;
            margin: 13px 0 0;
            padding: 7px;
            width: auto;
        }
        span.frame span img {
            display: block;
            float: left;
        }
        span.frame span span {
            clear: both;
            color: #333333;
            display: block;
            padding: 5px 0 0;
        }
        span.align-center {
            display: block;
            overflow: hidden;
            clear: both;
        }
        span.align-center > span {
            display: block;
            overflow: hidden;
            margin: 13px auto 0;
            text-align: center;
        }
        span.align-center span img {
            margin: 0 auto;
            text-align: center;
        }
        span.align-right {
            display: block;
            overflow: hidden;
            clear: both;
        }
        span.align-right > span {
            display: block;
            overflow: hidden;
            margin: 13px 0 0;
            text-align: right;
        }
        span.align-right span img {
            margin: 0;
            text-align: right;
        }
        span.float-left {
            display: block;
            margin-right: 13px;
            overflow: hidden;
            float: left;
        }
        span.float-left span {
            margin: 13px 0 0;
        }
        span.float-right {
            display: block;
            margin-left: 13px;
            overflow: hidden;
            float: right;
        }
        span.float-right > span {
            display: block;
            overflow: hidden;
            margin: 13px auto 0;
            text-align: right;
        }

        code,
        tt {
            margin: 0 2px;
            padding: 0 5px;
            white-space: nowrap;
            border: 1px solid #eaeaea;
            background-color: #f8f8f8;
            border-radius: 3px;
        }

        pre code {
            margin: 0;
            padding: 0;
            white-space: pre;
            border: none;
            background: transparent;
        }

        .highlight pre {
            background-color: #f8f8f8;
            border: 1px solid #cccccc;
            font-size: 17px;
            line-height: 23px;
            overflow: auto;
            padding: 6px 10px;
            border-radius: 3px;
        }

        pre {
            background-color: #f8f8f8;
            border: 1px solid #cccccc;
            font-size: 17px;
            line-height: 23px;
            overflow: auto;
            padding: 6px 10px;
            border-radius: 3px;
        }
        pre code,
        pre tt {
            background-color: transparent;
            border: none;
        }

        sup {
            font-size: 0.83em;
            vertical-align: super;
            line-height: 0;
        }
        * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }
`;

export const PropName = styled.span`
    font-family: monospace;
    font-weight: 500;
    color: #ffe394;
`;

function isValidReactRef(ref: unknown): ref is React.Ref<unknown> {
    return ref === null || typeof ref === "function" || Object.prototype.hasOwnProperty.call(ref, "current");
}

function withValidRef<TElement, TProps extends object>(
    Component: React.ComponentType<TProps & React.RefAttributes<TElement>>
): React.ForwardRefExoticComponent<React.PropsWithoutRef<TProps> & React.RefAttributes<TElement>> {
    const Wrapped = React.forwardRef<TElement, TProps>((props, ref) => (
        <Component {...props} ref={isValidReactRef(ref) ? ref : undefined} />
    ));
    Wrapped.displayName = Component.displayName;
    return Wrapped;
}

export const Description = withValidRef<HTMLDivElement, React.ComponentProps<"div">>(styled.div`
    font-size: 18px;
    flex-shrink: 0;
    margin: 0 0 20px 0;
`);

export const MoreInfo = withValidRef<HTMLParagraphElement, React.ComponentProps<"p">>(styled.p`
    font-size: 14px;
    flex-shrink: 0;
    margin: 0 0 20px 0;

    button {
        background-color: #f4f4f4;
        color: #2b2b2b;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 14px;
        border-radius: 4px;
        box-shadow: 0px 1px 2px #00000040;
        margin: 0 0.1em;
        border: none;
        cursor: pointer;
    }
`);

export const DocWrapper: React.FC = p => {
    const { children } = p;
    return (
        <BeautifulStyle>
            <div className="inner">{children}</div>
        </BeautifulStyle>
    );
};
