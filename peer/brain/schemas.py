"""JSON schemas for the brain's playbooks. Written strict (closed objects, all fields required,
nullable where optional) so the same schema works on Claude (--json-schema) and Codex
(--output-schema)."""

SOURCE = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "url": {"type": "string"},
        "date": {"type": "string"},
    },
    "required": ["title", "url", "date"],
    "additionalProperties": False,
}

ANSWER_THREAD = {
    "type": "object",
    "properties": {
        "relevant": {"type": "boolean"},
        "relevance_reason": {"type": "string"},
        "reply": {"type": "string"},
        "certainty": {"type": "string", "enum": ["high", "medium", "low"]},
        "as_of": {"type": "string"},
        "sources": {"type": "array", "items": SOURCE, "maxItems": 4},
        "why_it_matters": {"type": "string"},
        "needs_owner": {"type": "boolean"},
        "owner_note": {"type": "string"},
    },
    "required": ["relevant", "relevance_reason", "reply", "certainty", "as_of", "sources",
                 "why_it_matters", "needs_owner", "owner_note"],
    "additionalProperties": False,
}

SUMMARIZE_TRACKER = {
    "type": "object",
    "properties": {
        "one_line": {"type": "string"},
        "driver": {"type": "string"},
        "phase": {"type": "string"},
        "done": {"type": "array", "items": {"type": "string"}},
        "next": {"type": "array", "items": {"type": "string"}},
        "dates": {"type": "array", "items": {
            "type": "object",
            "properties": {"what": {"type": "string"}, "date": {"type": "string"}},
            "required": ["what", "date"], "additionalProperties": False}},
        "ship_target": {"type": ["string", "null"]},
        "waiting_on_owner": {"type": "array", "items": {"type": "string"}},
        "aliases": {"type": "array", "items": {"type": "string"}},
        "as_of": {"type": "string"},
    },
    "required": ["one_line", "driver", "phase", "done", "next", "dates", "ship_target",
                 "waiting_on_owner", "aliases", "as_of"],
    "additionalProperties": False,
}
