"use strict";
var Carbon = require("./src/carbon.js");
var pass = 0, fail = 0;
function t(name, cond){ if (cond){ pass++; console.log("  ok    " + name); } else { fail++; console.log("  FAIL  " + name); } }

var src = "A retired forensic accountant in Kochi discovers that the shell company draining her late brother's estate shares a registered address with the temple trust she has audited, unpaid, for eleven years. She has ninety days before the probate closes and the trail dissolves.";
var marked = Carbon.embed(src, { author: "R. Menon", recipient: "Netflix India" }, 12);

t("marked text is invisibly identical", Carbon.strip(marked) === src);
var r = Carbon.inspect(marked);
t("author recovered", r.author === "R. Menon");
t("recipient recovered", r.recipient === "Netflix India");
t("multiple marks embedded", r.marks > 2);

var partial = marked.slice(0, Math.floor(marked.length / 3));
t("partial copy still identifies", Carbon.inspect(partial).recipient === "Netflix India");

t("clean text yields nothing", Carbon.inspect(src).found === false);
t("stripped text yields nothing", Carbon.inspect(Carbon.strip(marked)).found === false);

var a = Carbon.embed(src, { author: "R. Menon", recipient: "Reader A" }, 12);
var b = Carbon.embed(src, { author: "R. Menon", recipient: "Reader B" }, 12);
t("splice detected", Carbon.inspect(a.slice(0, a.length/2) + b.slice(b.length/2)).spliced === true);

t("unicode payload survives", Carbon.inspect(Carbon.embed(src, { author: "ர. மேனன்", recipient: "தயாரிப்பு" }, 12)).author === "ர. மேனன்");

console.log("\n" + pass + " passed, " + fail + " failed\n");
process.exit(fail ? 1 : 0);
