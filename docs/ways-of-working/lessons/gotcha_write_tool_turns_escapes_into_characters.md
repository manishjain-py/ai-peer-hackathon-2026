---
name: gotcha-write-tool-turns-escapes-into-characters
description: "A backslash-u escape typed into a Write or Edit call lands in the file as the raw character it names, even inside a Python raw string: a zero-width joiner meant as an escape went in invisible; build the backslash with chr(92) and check the bytes, since grep -F with the escape matches the raw character too"
metadata:
  type: feedback
---

telugu-wp8a-14 (learnlikemagic, 2026-11-15) wrote a test-patch script with the Write tool. Its test data, inside
Python raw strings (`r'''...'''`), held `\u200c` (a zero-width non-joiner) so the test file would carry the visible
escape. The file landed with the raw, invisible character instead, in all four places, including the script's own
guard line. `command grep -c -F '\u200c'` "found" the escape on those lines, because this Mac's grep reads the
escape as the character too, so it could not tell the two apart. Only the byte check showed it.

**Why:** the tool decodes the escape before the file is written, so no quoting in the file's own language helps,
and an invisible character in a test or doc is unreviewable.

**How to apply:**
- Never type a backslash-u escape into Write or Edit when the file must keep the escape. Write the line from a
  short script that builds the backslash, `chr(92) + "u200c"`, or keep the data in a file you copy.
- Check the bytes afterwards: `LC_ALL=C command grep -c $'\xe2\x80\x8c' <file>` (UTF-8 of U+200C; 0 is the good
  answer, and grep -c then exits 1), or `perl -ne 'print "$.\n" if /\\u200c/' <file>` for the literal escape.
- A guard in the script itself (`assert chr(0x200C) not in text`) stops the next run from writing it raw.
