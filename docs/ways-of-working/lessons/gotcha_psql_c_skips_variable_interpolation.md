---
name: gotcha-psql-c-skips-variable-interpolation
description: "psql -c never substitutes :var or :'var' variables (only input psql reads from stdin or a file does): pipe the SQL in"
metadata:
  type: feedback
---

`psql -v em=x -c "select ... where email = :'em'"` fails with `syntax error at or near ":"`: psql substitutes its
variables only in input it reads (stdin, `-f` files), never in a `-c` string. A script that reads the result into a
variable can then mistake the error text for an empty answer (`telugu-wp5a-3`, 2026-11-08: "no users row" while two
rows existed; nothing was written, because the script checked for `ERROR`).

**Why:** quoting a value with `:'var'` is the safe way to pass an email or id into SQL from a shell script; it only works
when the SQL comes through psql's input.

**How to apply:** `print -r -- "select id from users where lower(email) = lower(:'em');" | psql -X -At "$URL" -v em="$EMAIL"`
(add `-v ON_ERROR_STOP=1` for writes), and treat any `ERROR` in captured output as a failure, never as "no rows".
