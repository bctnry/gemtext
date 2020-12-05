var Gemtext = (function(){

function _htmlEscape(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
var HTMLGenerator = {
    preamble: function () {
        return '';
    },
    postamble: function () {
        return '';
    },
    text: function (content) {
        return _htmlEscape(content) + "<br />";
    },
    link: function (url, alt) {
        return "<a href=\"" + url + "\">" + (alt || url) + "</a><br />\n";
        ;
    },
    preformatted: function (content, alt) {
        return "<pre alt=\"" + alt + "\">" + _htmlEscape(content.join('\n')) + "</pre>\n";
    },
    heading: function (level, text) {
        return "<h" + level + ">" + _htmlEscape(text) + "</h" + level + ">\n";
    },
    unorderedList: function (content) {
        return "<ul>" + content.map(function (v) { return "<li>" + _htmlEscape(v) + "</li>"; }).join('') + "</ul>\n";
    },
    quote: function (content) {
        return "<blockquote>" + _htmlEscape(content) + "</blockquote>\n";
    }
};
var MarkdownGenerator = {
    preamble: function () {
        return '';
    },
    postamble: function () {
        return '';
    },
    text: function (content) {
        return content + "\n";
    },
    link: function (url, alt) {
        return "\n\n[" + alt + "](" + url + ")\n\n";
        ;
    },
    preformatted: function (content, alt) {
        return "\n``` " + alt + "\n" + content.join('\n') + "```";
    },
    heading: function (level, text) {
        return '#'.repeat(level) + " " + text;
    },
    unorderedList: function (content) {
        return "\n" + content.map(function (v) { return "+ " + v; }).join('\n') + "\n";
    },
    quote: function (content) {
        return "\n" + content.map(function (v) { return "> " + v; }).join('\n') + "\n";
    }
};
var OrgGenerator = {
    preamble: function () {
        return '';
    },
    postamble: function () {
        return '';
    },
    text: function (content) {
        return content + "\n";
    },
    link: function (url, alt) {
        return "\n\n[" + alt + "](" + url + ")\n\n";
        ;
    },
    preformatted: function (content, alt) {
        return "\n``` " + alt + "\n" + content.join('\n') + "```";
    },
    heading: function (level, text) {
        return '*'.repeat(level) + " " + text;
    },
    unorderedList: function (content) {
        return "\n" + content.map(function (v) { return "+ " + v; }).join('\n') + "\n";
    },
    quote: function (content) {
        return "\n" + content.map(function (v) { return "> " + v; }).join('\n') + "\n";
    }
};
var DefaultGenerator = {
    preamble: function () {
        return '';
    },
    postamble: function () {
        return '';
    },
    text: function (content) {
        return content + "\n";
    },
    link: function (url, alt) {
        return "=> " + url + " " + alt + "\n";
        ;
    },
    preformatted: function (content, alt) {
        return "``` " + alt + "\n" + content.join('\n') + "\n```\n";
    },
    heading: function (level, text) {
        return '#'.repeat(level) + " " + text + "\n";
    },
    unorderedList: function (content) {
        return content.map(function (v) { return "+ " + v; }).join('\n') + "\n";
    },
    quote: function (content) {
        return content.map(function (v) { return "> " + v; }).join('\n') + "\n";
    }
};
var ParseResult = /** @class */ (function () {
    function ParseResult(data) {
        this.data = data;
    }
    ParseResult.prototype.generate = function (generator) {
        return this.data.map(function (v) {
            switch (v._) {
                case 1: return generator.text(v.val);
                case 2: return generator.link(v.url, v.alt);
                case 3: return generator.preformatted(v.content, v.alt);
                case 4: return generator.heading(v.level, v.text);
                case 5: return generator.unorderedList(v.content);
                case 6: return generator.quote(v.content);
            }
        }).join('');
    };
    return ParseResult;
}());

function parse(source, strict) {
    if (strict === void 0) { strict = false; }
    var res = [];
    var preformatting = false;
    var preformattingAlt = '';
    var preformattingBuffer = [];
    var listStarted = false;
    var listBuffer = [];
    var quoteStarted = false;
    var quoteBuffer = [];
    source.replace(/\r\n/g, '\n').split('\n').forEach(function (v) {
        if (preformatting) {
            if (v.trim() === '```') {
                res.push({ _: 3, content: preformattingBuffer, alt: preformattingAlt });
                preformatting = false;
                preformattingBuffer = [];
                preformattingAlt = '';
                return;
            }
            else {
                preformattingBuffer.push(v);
                return;
            }
        }
        if (listStarted && !v.startsWith('* ')) {
            res.push({ _: 5, content: listBuffer });
            listStarted = false;
            listBuffer = [];
        }
        if (quoteStarted && !(((strict && v.startsWith('> ')) || (!strict && v.startsWith('>'))))) {
            res.push({ _: 6, content: quoteBuffer });
            quoteStarted = false;
            quoteBuffer = [];
        }
        if ((strict && v.startsWith('=> ')) || (!strict && v.startsWith('=>'))) {
            var x = v.substring(2).trim();
            var i = 0;
            while (i < x.length && !' \t\r\n\v\b'.includes(x[i])) {
                i++;
            }
            var url = x.substring(0, i);
            x = x.substring(i).trim();
            res.push({ _: 2, url: url, alt: x });
        }
        else if ((strict && v.startsWith('> ')) || (!strict && v.startsWith('>'))) {
            if (!quoteStarted) {
                quoteStarted = true;
                quoteBuffer = [];
            }
            quoteBuffer.push(v.substring(1).trim());
        }
        else if (v.startsWith('#')) {
            var i = 0;
            while (v[i] == '#') {
                i++;
            }
            var level = i;
            if (strict) {
                if (' \t\r\n\v\b'.includes(v[i])) {
                    res.push({ _: 4, level: level, text: v.substring(i).trim() });
                }
                else {
                    res.push({ _: 1, val: v });
                }
            }
            else {
                res.push({ _: 4, level: level, text: v.substring(i).trim() });
            }
        }
        else if (v.startsWith('```')) {
            preformattingAlt = v.substring(3).trim();
            preformatting = true;
        }
        else if (v.startsWith('* ')) {
            if (!listStarted) {
                listStarted = true;
                listBuffer = [];
            }
            listBuffer.push(v.substring(2).trim());
        }
        else {
            res.push({ _: 1, val: v });
        }
    });
    if (preformattingBuffer.length > 0) {
        res.push({ _: 3, content: preformattingBuffer, alt: preformattingAlt });
    }
    if (listBuffer.length > 0) {
        res.push({ _: 5, content: listBuffer });
    }
    if (quoteBuffer.length > 0) {
        res.push({ _: 6, content: quoteBuffer });
    }
    return new ParseResult(res);
}

return {
    HTMLGenerator: HTMLGenerator,
    MarkdownGenerator: MarkdownGenerator,
    OrgGenerator: OrgGenerator,
    DefaultGenerator: DefaultGenerator,
    ParseResult: ParseResult,
    parse: parse
}
})();
