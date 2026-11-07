"""Is a meeting line for the Peer? Plain rules first (no AI), on the words as transcribed.

Speech to text hears "Peer" as "pier" (spike 1d), "AI Peer" as "ipa", drops a leading "Peer," or turns
it into "here" (WP4 spike, 6 Nov), and may misspell the owner's name, so both come as families of
homophones, and the scene's lines address the Peer the way people do ("a question for Manish's
assistant"). Four answers:
- "update":   someone asks for the owner or the owner's update ("is Manish here", "Manish's update",
              "over to Manish") -> play the approved clip.
- "question": a line put to the Peer ("Peer, who is driving offline mode?", "Manish's assistant, ...")
              -> the holding line at once, then a live answer.
- "maybe":    a question about the owner or the owner's work that names no one -> the warm session
              decides (it replies PASS when the line is not for the Peer): the cheap brain call.
- "none":     everyone else's talk -> notes only.
The caller drops every line whose speaker is the Peer itself before asking (the other bot heard the Peer
say "Manish's AI peer ... Here is Manish's update", the very trigger phrases).
"""
from __future__ import annotations

import re

PEER = r"(?:peer|peers|pier|piers|pierre|pear|pia|ipa|i ?pier|i ?peer|eye ?peer|eye ?pier|p\s?e\s?e\s?r)"
QUESTION = r"\b(?:who|what|what's|when|where|why|how|which|is|are|was|were|can|could|do|does|did|will|would|should|any|has|have)\b"
# "Peer, who is ..." at the start of a line came back as "here who is ..." (WP4 spike, 6 Nov): no English
# line starts "here who/what/when ...", so a line-initial here/hear before a question word is the Peer.
MISHEARD_START = r"^ (?:here|hear|ear|beer|fear|near) (?:who|what|what's|when|where|why|how|can|could|do|does|did|will|would|should|any)\b"
NOT_PEER = r"\b(?:peer|pier)[ -](?:review\w*|reviewed|to[ -]peer|pressure|group|support|learning|feedback)\b"
SMALLTALK = {"thanks", "thank", "you", "ok", "okay", "great", "cool", "got", "it", "bye", "nice", "perfect", "sure", "so",
             "much", "very", "that's", "helpful", "good", "and", "the", "ai", "a", "i", "yes", "yeah", "right", "alright", "hi",
             "hello", "welcome"}


def owner_pattern(first: str) -> str:
    f = re.escape(first.lower())
    if first.lower() == "manish":
        return r"(?:manish|maneesh|manesh|munish|monish|manis|manisha?)"
    return f


def classify(text: str, owner_first: str = "Manish", topics: list[str] | None = None) -> tuple[str, str]:
    t = " " + re.sub(r"[^\w' ]+", " ", (text or "").lower()) + " "
    t = re.sub(r"\s+", " ", t)
    o = owner_pattern(owner_first)
    t = re.sub(NOT_PEER, " ", t)
    named_peer = (re.search(rf"\b(?:ai |a i |the )?{PEER}\b", t) or re.search(rf"\b{o}'?s? (?:ai|a i|assistant|bot)\b", t)
                  or re.search(r"\b(?:\w+'s|\w+s|the|your|our|ai|a i) (?:ai |a i )?assistant\b", t)
                  or re.search(MISHEARD_START, t))
    update_ask = (
        re.search(rf"\b{o}'?s (?:update|status|news|part|section|turn)\b", t)
        or re.search(rf"\bupdate (?:from|for|on behalf of) {o}\b", t)
        or re.search(rf"\b(?:is|was) {o} (?:here|there|on|joining|around|with us|in the call|on the call|coming|online)\b", t)
        or re.search(rf"\b(?:where is|where's|anyone seen|did) {o}\b", t)
        or re.search(rf"\b(?:over to|hear from|turn for|your turn) {o}\b", t)
        or re.search(rf"\b{o} (?:can|could|would|do) you (?:give|share|go|tell|update)\b", t)
        or re.search(rf"\b{o} (?:are you|you there|your update)\b", t)
        or re.search(rf"\b(?:what's|what is|what has) {o} (?:working on|been working on|been up to|up to|doing)\b", t)
        or (named_peer and re.search(r"\b(?:update|status update|his update|the update)\b", t)
            and re.search(rf"\b(?:{o}|his|their|the owner)\b", t))
    )
    if update_ask:
        return "update", "asks for the owner or the owner's update"
    if named_peer:
        rest = set(re.sub(rf"\b{PEER}\b|\b{o}'?s?\b", " ", t).split())
        if rest <= SMALLTALK:
            return "none", "a thanks or a greeting to the Peer"
        return "question", "puts a line to the Peer"
    asks = "?" in (text or "") or re.match(rf"^ {QUESTION}", t) or re.search(rf"\b(?:wondering|anyone know|tell us|any update)\b", t)
    about = re.search(rf"\b{o}\b", t) or any(re.search(rf"\b{re.escape(w.lower())}\b", t) for w in (topics or []) if len(w) > 2)
    if asks and about:
        return "maybe", "a question about the owner or the owner's work"
    return "none", "not for the Peer"
