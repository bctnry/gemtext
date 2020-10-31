export type Generator<T> = {
    preamble(): T,
    postamble(): T,
    text(content: string): T,
    link(url: string, alt: string): T,
    preformatted(content: string[], alt: string): T,
    heading(level: number, text: string): T,
    unorderedList(content: string[]): T,
    quote(content: string[]): T,
}

export const HTMLGenerator: Generator<string> = {
    preamble: (): string => {
        return '<html><body>\n';
    },
    postamble: (): string => {
        return '</body></html>\n';
    },
    text: (content: string): string => {
        return `${content}\n`;
    },
    link: (url: string, alt: string): string => {
        return `<a href="${url}">${alt||url}</a><br />\n`;;
    },
    preformatted: (content: string[], alt: string): string => {
        return `<pre alt="${alt}">${content.join('\n')}</pre>\n`;
    },
    heading: (level: number, text: string): string => {
        return `<h${level}>${text}</h${level}>\n`;
    },
    unorderedList: (content: string[]): string => {
        return `<ul>${content.map((v) => `<li>${v}</li>`).join('')}</ul>\n`;
    },
    quote: (content: string[]): string => {
        return `<blockquote>${content.join('\n')}</blockquote>\n`;
    }
}

export const MarkdownGenerator: Generator<string> = {
    preamble: (): string => {
        return '';
    },
    postamble: (): string => {
        return '';
    },
    text: (content: string): string => {
        return `${content}\n`;
    },
    link: (url: string, alt: string): string => {
        return `\n\n[${alt}](${url})\n\n`;;
    },
    preformatted: (content: string[], alt: string): string => {
        return `\n\`\`\` ${alt}\n${content.join('\n')}\`\`\``;
    },
    heading: (level: number, text: string): string => {
        return `${'#'.repeat(level)} ${text}`;
    },
    unorderedList: (content: string[]): string => {
        return `\n${content.map((v) => `+ ${v}`).join('\n')}\n`;
    },
    quote: (content: string[]): string => {
        return `\n${content.map((v) => `> ${v}`).join('\n')}\n`;
    }
}

export const DefaultGenerator: Generator<string> = {
    preamble: (): string => {
        return '';
    },
    postamble: (): string => {
        return '';
    },
    text: (content: string): string => {
        return `${content}\n`;
    },
    link: (url: string, alt: string): string => {
        return `=> ${url} ${alt}\n`;;
    },
    preformatted: (content: string[], alt: string): string => {
        return `\`\`\` ${alt}\n${content.join('\n')}\n\`\`\`\n`;
    },
    heading: (level: number, text: string): string => {
        return `${'#'.repeat(level)} ${text}\n`;
    },
    unorderedList: (content: string[]): string => {
        return `${content.map((v) => `+ ${v}`).join('\n')}\n`;
    },
    quote: (content: string[]): string => {
        return `${content.map((v) => `> ${v}`).join('\n')}\n`;
    }
}

type ParseResultData =
    {_:1, val: string}
    | {_:2, url: string, alt: string}
    | {_:3, content: string[], alt: string}
    | {_:4, level: number, text: string}
    | {_:5, content: string[]}
    | {_:6, content: string[]}
;

export class ParseResult {
    constructor(public data: ParseResultData[]) {}
    generate<T>(generator: Generator<T>) {
        return this.data.map((v) => {
            switch (v._) {
                case 1: return generator.text(v.val);
                case 2: return generator.link(v.url, v.alt);
                case 3: return generator.preformatted(v.content, v.alt);
                case 4: return generator.heading(v.level, v.text);
                case 5: return generator.unorderedList(v.content);
                case 6: return generator.quote(v.content);
            }
        }).join('');
    }
}

export function parse(source: string, strict: boolean = false): ParseResult {
    let res: ParseResultData[] = [];
    let preformatting: boolean = false;
    let preformattingAlt: string = '';
    let preformattingBuffer: string[] = [];
    let listStarted: boolean = false;
    let listBuffer: string[] = [];
    let quoteStarted: boolean = false;
    let quoteBuffer: string[] = [];
    source.replace(/\r\n/g, '\n').split('\n').forEach((v) => {
        if (preformatting) { preformattingBuffer.push(v); return; }
        if (listStarted && !v.startsWith('* ')) {
            res.push({_:5, content: listBuffer});
            listStarted = false;
            listBuffer = [];
        }
        if (quoteStarted && !(((strict && v.startsWith('> '))||(!strict && v.startsWith('>'))))) {
            res.push({_:6, content: quoteBuffer});
            quoteStarted = false;
            quoteBuffer = [];
        }

        if ((strict && v.startsWith('=> '))||(!strict && v.startsWith('=>'))) {
            let x = v.substring(2).trim();
            let i = 0; while (i < x.length && !' \t\r\n\v\b'.includes(x[i])) { i++; }
            let url = x.substring(0, i); x = x.substring(i).trim();
            res.push({_:2, url, alt: x});
        } else if ((strict && v.startsWith('> '))||(!strict && v.startsWith('>'))) {
            if (!quoteStarted) { quoteStarted = true; quoteBuffer = []; }
            quoteBuffer.push(v.substring(1).trim());
        } else if (v.startsWith('#')) {
            let i = 0; while (v[i] == '#') { i++; }
            let level = i;
            if (strict) {
                if (' \t\r\n\v\b'.includes(v[i])) {
                    res.push({_:4, level, text: v.substring(i).trim()});
                } else {
                    res.push({_:1, val: v});
                }
            } else {
                res.push({_:4, level, text: v.substring(i).trim()});
            }
        } else if (v.startsWith('```')) {
            if (preformatting) {
                res.push({_:3, content: preformattingBuffer, alt: preformattingAlt});
                preformatting = false;
                preformattingBuffer = [];
                preformattingAlt = '';
            } else {
                preformattingAlt = v.substring(3).trim();
                preformatting = true;
            }
        } else if (v.startsWith('* ')) {
            if (!listStarted) { listStarted = true; listBuffer = []; }
            listBuffer.push(v.substring(2).trim());
        } else {
            res.push({_:1, val:v});
        }
    });
    if (listBuffer.length > 0) {
        res.push({_:5, content:listBuffer});
    }
    if (quoteBuffer.length > 0) {
        res.push({_:6, content:quoteBuffer});
    }
    return new ParseResult(res);
}