#!/bin/zsh
# privacy-check.sh: before anything from a branch goes to Manish or Telegram, count what in it
# could come from his company's walkthrough recording or from the private bases.
#
# Usage: demo-video/tools/privacy-check.sh <head sha> <base sha>
# Prints counts only, never a term. Expect 0 and 0.
#   1. Files the branch changed (base..head) that hold a line of the private list of real
#      terms (~/.ai-peer/demo-video-private/ui-wow/real-terms.txt, written by WP6 from the
#      walkthrough; outside git on purpose).
#   2. Files the branch changed that are exact copies (sha256; Git LFS ids for media) of any
#      private file in ui-wow/ or bases/.
# Rule C8 in demo-video/docs/DESIGN.md.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
HEAD_SHA="$1"
BASE_SHA="$2"
P="$HOME/.ai-peer/demo-video-private"
LIST="$P/ui-wow/real-terms.txt"
T="${TMPDIR:-/tmp}/privacy-check.$$"
mkdir -p "$T"
[ -s "$LIST" ] || { echo "no private list at $LIST: cannot check"; exit 2; }
[ "$(command grep -c '^[[:space:]]*$' "$LIST")" = "0" ] || { echo "the list has empty lines: they match everything; fix the list"; exit 2; }
git diff --name-only "$BASE_SHA" "$HEAD_SHA" > "$T/changed.txt"
echo "changed files: $(wc -l < "$T/changed.txt" | tr -d ' ')"
HITS=0
if [ -s "$T/changed.txt" ]; then
  HITS=$(git grep -i -F -l -f "$LIST" "$HEAD_SHA" -- $(cat "$T/changed.txt") 2>/dev/null | wc -l | tr -d ' ')
fi
echo "changed files holding a real term: $HITS"
find "$P/ui-wow" "$P/bases" -type f ! -name 'real-terms.txt' -exec shasum -a 256 {} + 2>/dev/null | awk '{print $1}' | sort -u > "$T/private.txt"
: > "$T/branch.txt"
while IFS= read -r f; do
  head200=$(git show "$HEAD_SHA:$f" 2>/dev/null | head -c 200)
  if print -r -- "$head200" | command grep -q '^version https://git-lfs'; then
    git show "$HEAD_SHA:$f" | awk '/^oid sha256:/{sub("oid sha256:","");print}' >> "$T/branch.txt"
  else
    git show "$HEAD_SHA:$f" 2>/dev/null | shasum -a 256 | awk '{print $1}' >> "$T/branch.txt"
  fi
done < "$T/changed.txt"
echo "private files hashed: $(wc -l < "$T/private.txt" | tr -d ' ')"
echo "changed files that are exact copies of a private file: $(sort -u "$T/branch.txt" | comm -12 - "$T/private.txt" | wc -l | tr -d ' ')"
rm -rf "$T"
