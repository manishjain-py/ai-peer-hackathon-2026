---
name: gotcha-resume-caches-a-preflight-failure
description: "Workflow resumeFromRunId caches FAILURES too — one preflight that failed while the backend was down becomes the permanent cached answer, so every later resume of that run fails identically no matter how healthy the machine is"
metadata:
  node_type: memory
  type: project
---

**`resumeFromRunId` replays cached results by (prompt, opts) — and a FAILED
result caches exactly like a successful one.** A step that failed for a purely
environmental reason is frozen into the run forever.

Hit on 2026-08-28 shipping g5 EVS ch1. Sequence:
1. Practice leg held at the gate. Legit.
2. Backend died between legs (nothing to do with the leg — the checkout never
   moved; several processes on the Mac died together).
3. I resumed. Its **Preflight** agent ran while the backend was down and
   returned `{backend_ok: false, error: "no backend listening on localhost:8000
   (curl exit 7, connection refused)"}`. That result was appended to
   `journal.jsonl`.
4. I restarted the backend, **verified `/admin/v2/dag/definition` → 200**, and
   resumed again. It failed with the identical preflight error — while the
   backend log showed it happily serving that very run's artifact POSTs.

The tell: the journal had **exactly one** result for the preflight key, and
**zero** keys with more than one result. The cached failure was not being
shadowed by anything; it *was* the answer.

```bash
# is a failure cached in this run?
python3 - <<'EOF'
import json,pathlib
p=pathlib.Path("<transcriptDir>/journal.jsonl")
for l in p.read_text().splitlines():
    r=json.loads(l)
    if r.get("type")=="result" and "false" in json.dumps(r.get("result"))[:300].lower():
        print(r.get("key")[:30], json.dumps(r.get("result"))[:160])
EOF
```

**The fix is a FRESH runId, never another resume.** There is no cache-invalidation
knob. Accept the re-authoring cost. For the practice factory that is ~75 min and
a fresh batch of questions, so any hand-diagnosis of specific questions in the
dead run is thrown away — diagnose after the new run, not before.

⚠ **Corollary for [[gotcha_factory_audio_dies_on_10min_shell_timeout]] and any
"restart and resume" instinct:** verify the environment is healthy BEFORE
resuming, because the resume itself is what burns the cache entry. One resume
attempt against a sick machine costs you the whole run.

Related: [[gotcha_stale_local_backend_serves_old_code]],
[[gotcha_shared_checkout_concurrent_sessions]], [[project_practice_factory]].
