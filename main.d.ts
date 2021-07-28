export declare type Renderer<T> = {
    preamble(): T;
    postamble(): T;
    text(content: string): T;
    link(url: string, alt: string): T;
    preformatted(content: string[], alt: string): T;
    heading(level: number, text: string): T;
    unorderedList(content: string[]): T;
    quote(content: string): T;
};
export declare const HTMLRenderer: Renderer<string>;
export declare const MarkdownRenderer: Renderer<string>;
export declare const OrgRenderer: Renderer<string>;
export declare const DefaultRenderer: Renderer<string>;
declare type ParseResultData = {
    _: 1;
    val: string;
} | {
    _: 2;
    url: string;
    alt: string;
} | {
    _: 3;
    content: string[];
    alt: string;
} | {
    _: 4;
    level: number;
    text: string;
} | {
    _: 5;
    content: string[];
} | {
    _: 6;
    content: string;
};
export declare class ParseResult {
    data: ParseResultData[];
    constructor(data: ParseResultData[]);
    generate<T>(generator: Renderer<T>): string;
}
export declare function parse(source: string, strict?: boolean): ParseResult;
export {};
