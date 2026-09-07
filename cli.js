#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var Carbon = require("./src/carbon.js");

var argv = process.argv.slice(2);
var cmd = argv[0];

function usage() {
  console.log([
    "",
    "carbon — invisible authorship marks for text documents",
    "",
    "  carbon mark <file> --author \"Name\" --to \"Reader A\" [--to \"Reader B\"] [--out dir]",
    "  carbon check <file>",
    "  carbon strip <file>",
    "",
    "mark    writes one copy per reader, each carrying a different invisible mark",
    "check   reports the author and reader recorded in a suspect file",
    "strip   removes every mark, leaving the clean text",
    ""
  ].join("\n"));
}

function flag(name) {
  var out = [];
  for (var i = 0; i < argv.length; i++) if (argv[i] === "--" + name) out.push(argv[i + 1]);
  return out;
}

function slug(s) {
  return s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "copy";
}

if (!cmd || cmd === "-h" || cmd === "--help") { usage(); process.exit(0); }

var file = argv[1];
if (!file || !fs.existsSync(file)) {
  console.error("File not found: " + (file || "(none)"));
  process.exit(1);
}
var text = fs.readFileSync(file, "utf8");

if (cmd === "mark") {
  var author = flag("author")[0] || "Unattributed";
  var readers = flag("to");
  if (!readers.length) readers = ["master"];
  var outDir = flag("out")[0] || ".";
  var issued = new Date().toISOString();
  var clean = Carbon.strip(text);
  var hash = crypto.createHash("sha256").update(clean.replace(/\s+/g, " ").trim()).digest("hex");

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log("\nsource sha256  " + hash);
  console.log("issued         " + issued + "\n");

  readers.forEach(function (reader) {
    var fields = { author: author, recipient: reader, issued: issued };
    var marked = Carbon.embed(clean, fields, 40);
    var id = Carbon.parse(Carbon.extract(marked)[0]).id;
    var base = path.basename(file, path.extname(file));
    var dest = path.join(outDir, base + "." + slug(reader) + ".txt");
    fs.writeFileSync(dest, marked, "utf8");
    console.log("  " + id + "  " + reader.padEnd(24) + dest);
  });
  console.log("");
  process.exit(0);
}

if (cmd === "check") {
  var r = Carbon.inspect(text);
  if (!r.found) {
    console.log("\nNo mark found.");
    console.log("Either this text never carried one, or it was rewritten or stripped.\n");
    process.exit(2);
  }
  console.log("\nAuthor      " + r.author);
  console.log("Issued to   " + r.recipient);
  console.log("Date        " + r.issued);
  console.log("Copy id     " + r.id);
  console.log("Marks       " + r.marks + " intact");
  if (r.spliced) {
    console.log("\nWarning: " + r.copies.length + " different copies are spliced together here:");
    r.copies.forEach(function (c) { console.log("  " + c.id + "  " + c.recipient); });
  }
  console.log("");
  process.exit(0);
}

if (cmd === "strip") {
  process.stdout.write(Carbon.strip(text));
  process.exit(0);
}

usage();
process.exit(1);
