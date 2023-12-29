#!/usr/bin/env python3
"""
Extract full case folding mappings from the Unicode Character Database to a
TypeScript file.

These mappings [1] can be used to process a Unicode string for case-insensitive
comparisons.

Copyright © 2023 James Seo <james@equiv.tech> (MIT license).

[1]: https://www.unicode.org/Public/UCD/latest/ucd/CaseFolding.txt
"""


import argparse
from typing import Generator
from urllib.request import urlopen
from sys import argv

Mapping = tuple[str, list[str]]
StringGenerator = Generator[str, None, None]
MappingGenerator = Generator[Mapping, None, None]

DATA_URL = "https://www.unicode.org/Public/UCD/latest/ucd/CaseFolding.txt"
DEFAULT_OUTFILE = "casefoldingmap.ts"


def gen_inlines(infile: str | None) -> StringGenerator:
    if infile is None:
        with urlopen(DATA_URL) as f:
            yield from f.read().decode("utf-8").splitlines()
    else:
        with open(infile, "r") as f:
            yield from f.readlines()


def gen_mappings(infile: str | None) -> MappingGenerator:
    for inline in gen_inlines(infile):
        line = inline.split("#")[0]
        if not line:
            continue

        parts = [x.strip() for x in line.split(";")]
        char, status, replacements = parts[:3]
        if status != "C" and status != "F":
            continue

        mapping = replacements.split(" ")
        yield char, mapping


def write_outfile(mappings: MappingGenerator, outfile: str):
    lines = [
        f"/* Generated by {argv[0]} */",
        "const caseFoldingMap: Record<string, string> = {",
    ]

    for char, mapping in mappings:
        codepoint = chr(int(char, 16))
        replacement = "".join(chr(int(x, 16)) for x in mapping)
        lines.append(f'  "{codepoint}": "{replacement}",')

    lines.append("} as const;")
    lines.append("export default caseFoldingMap;")

    with open(outfile, "w") as ofile:
        for line in lines:
            print(line, file=ofile)

    print(f"Extracted {len(lines) - 4} mappings.")


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Extract full case folding mappings from the "
            "Unicode Character Database to a TypeScript file."
        )
    )
    parser.add_argument(
        "outfile",
        help=f"Output path to binary mapping file (default: {DEFAULT_OUTFILE}",
        default=DEFAULT_OUTFILE,
        metavar="OUTFILE",
        nargs="?",
    )
    parser.add_argument(
        "-i",
        "--infile",
        help="Path to CaseFolding.txt (will be downloaded if not provided)",
    )

    args = parser.parse_args()
    mappings = gen_mappings(args.infile)
    write_outfile(mappings, args.outfile)


if __name__ == "__main__":
    main()