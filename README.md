# Carbon Copy

Invisible authorship marks for text documents.

Send a synopsis, a treatment or a script to five readers and you get five copies that look identical and aren't. Each one carries a different invisible signature naming the author, the reader it was issued to, and the date. If a version turns up somewhere it shouldn't, paste it back in and the text tells you which copy it came from.

No dependencies, no build step, no server. One file of code and a page that runs from disk.

## What it does not do

It does not stop anyone copying your work, and it does not make an AI model refuse to process it. A document arriving at a language model is just characters in a prompt — it cannot execute anything or set a flag inside someone else's inference pipeline, and models deliberately ignore instructions embedded in documents because otherwise anyone could stamp a claim on someone else's text and lock the real author out.

So this is forensic, not preventive. It answers *who leaked it*, not *can they copy it*. That is still the useful half: the same idea, done manually with altered character names, is how the film industry has traced leaks for fifty years.

**It breaks under:** an AI rewrite (the marks die with the original sentences), screenshots, OCR, retyping by hand, and platforms that normalise zero-width characters out on paste — WhatsApp, some email clients, some editors. Anyone who knows to look can strip every mark with one regular expression. Test your delivery channel before you rely on it.

Pair it with a dated registration — the Screenwriters Association in India, or your national copyright office — and an NDA. Those are what actually settle a dispute. This tells you who to point them at.

## Use it in the browser

Open `index.html`. Nothing is uploaded; everything runs locally.

1. Enter the author name and one reader per line.
2. Paste the synopsis and press **Make reader copies**.
3. Copy or download each reader's version and send it.
4. When something surfaces, paste it into **Check a document**.

## Use it from the command line

```bash
node cli.js mark synopsis.txt --author "R. Menon" \
  --to "Yash Raj Films" --to "Netflix India" --out ./copies

node cli.js check leaked.txt
node cli.js strip marked.txt > clean.txt
```

`mark` prints a SHA-256 of the source text and the issue timestamp. Keep that line — it is your record of what existed and when.

## Use it as a library

```js
const Carbon = require("./src/carbon.js");   // or <script src="src/carbon.js"> for window.Carbon

const marked = Carbon.embed(text, {
  author: "R. Menon",
  recipient: "Netflix India"
});

Carbon.inspect(marked);
// { found: true, marks: 9, author: "R. Menon", recipient: "Netflix India", ... }
```

| Function | Purpose |
| --- | --- |
| `embed(text, fields, every)` | Weave a mark through the text, repeated every `every` words (default 40) |
| `inspect(text)` | Report author, reader, date, mark count, and whether copies were spliced |
| `extract(text)` | Return every raw payload recovered |
| `strip(text)` | Remove all marks, returning the clean original |
| `reveal(text, glyph)` | Replace marks with a visible glyph, for previewing |

## How the mark works

Four zero-width Unicode characters — `U+200B`, `U+200C`, `U+200D`, `U+2060` — are used as base-4 digits, so each pair of bits becomes one invisible character. The payload is `CBN1 · author · reader · ISO timestamp · random id`, joined with `U+001F` and encoded as UTF-8.

Each mark is bracketed by two more invisible characters, `U+2061` and `U+2062`, so the decoder knows where it starts and stops. The whole mark repeats every 40 words, which means a reader who copies one paragraph out of twelve still hands you an identification.

Two safeguards against false positives: the payload must decode as valid UTF-8, and it must begin with the `CBN1` prefix. Stray zero-width characters from an unrelated document will not produce a match. If the sentinels are stripped but the digits survive, a salvage pass hunts for orphaned runs and tries them anyway.

`inspect` also flags splicing — if a document contains marks from two different readers, someone assembled it from more than one copy, and it says so.

## What to build next

The obvious weakness is that zero-width characters can be stripped in one pass. The stronger version marks the prose itself: generate each reader's copy with different synonym choices and clause orderings, so the fingerprint is carried by the wording and cannot be removed without rewriting the text. Marks catch the careless copier; lexical variants catch the careful one.

## Licence

MIT. See `LICENSE`.
