# gemtext

A parser for text/gemini files.

(NOTE: As of 2020.10.31, this library comfronts to Gemini specification v0.14.2 (July 2nd 2020).)

## Usage

Basic usage:

``` typescript
import * as Gemtext from 'gemtext';

Gemtext.parse(yourSourceStringHere).generate(Gemtext.HTMLGenerator);
```

With built-in CLI tool:

``` bash
gemtext [-s|--strict] [html|md|org] [input file name] [output file name]
```

`[-s|--strict]` and `[output file name]` can be omitted.

### API

+ `parse`(source: **string**, strict: **boolean** = `false`): `ParseResult`
+ `ParseResult`.`generate`
  - `generate`<**T**>(generator: **Generator**<**T**>): **T**
+ Generators
  - `Generator<T>`: The base type of all generators.
  - `HTMLGenerator`: **Generator**<**string**> - Generator that generates HTML string.
  - `MarkdownGenerator`: **Generator**<**string**> - Generator that generates Markdown string.
  - `OrgGenerator`: **Generator**<**string**> - Generator that generates org-mode string.

### "Strict" gemtext

I decided to have my own take on a strict gemtext subset.

Things that are optional in the official spec but aren't in this subset:

+ 5.4.2 Link lines: there must be at least 1 whitespace character after `=>`.
+ 5.5.1 Heading lines: there must be at least 1 whitespace character after the last `#`.
+ 5.5.3 Quote lines: there must be at least 1 whitespace character after `>`.

Strict mode parsing does not raise exceptions; when a text line does not meet the strict requirements, it will be simply regarded as a normal (unformatted) text line.

### Custom generator

To write your own custom generator, create a new object that contains the following methods:

+ `preamble`() - Preamble. e.g. HTML header stuff before main content.
+ `postamble`() - Postamble. e.g. HTML footer stuff before main content (e.g. closing `<html>` tags and stuff).
+ `text`(content: **string**) - normal text lines.
+ `link`(url: **string**, alt: **string**)
+ `preformatted`(content: **string**[], alt: **string**)
+ `heading`(level: **number**, text: **string**)
+ `unorderedList`(content: **string**[])
+ `quote`(content: **string**[])

``` typescript
const MyCustomGenerator: Gemtext.Generator<string> = {
    // ...implement all the methods here.
}
```

## Build

You'll need typescript.

```
npm run build
```
