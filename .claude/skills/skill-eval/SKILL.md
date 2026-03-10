---
name: skill-eval
description: "Evaluate skills with test cases, benchmark tracking, A/B comparison, and obsolescence detection."
argument-hint: "{skill-name} [--all|--benchmark|--compare|--obsolescence]"
---

# Skill Eval

Evaluate whether skills produce good results by running test cases against them. Supports benchmark tracking over time, A/B comparison against bare model, and obsolescence detection for capability-uplift skills.

## When to Use This Skill

- "Evaluate skill X"
- "Run skill evals"
- "Is this skill still useful?"
- "Compare skill X against baseline"
- "Benchmark all skills"
- After modifying a skill, to verify it still produces quality output
- Before deprecating a skill, to check if the model has absorbed its capabilities

## Commands

| Command | Purpose |
|---------|---------|
| `/skill-eval {name}` | Run all eval cases for one skill |
| `/skill-eval --all` | Run evals for all skills that have `evals/` dirs |
| `/skill-eval --benchmark {name}` | Run + append metrics to JSONL benchmark file |
| `/skill-eval --compare {name}` | A/B: skill loaded vs bare model (blind eval) |
| `/skill-eval --obsolescence` | Check all `capability-uplift` skills against baseline |

## Schemas

- **Eval case format**: `.claude/schemas/eval-case.schema.yaml`
- **Result format**: `.claude/schemas/eval-result.schema.json`

## Steps

### 1. Parse Arguments

Parse the command to determine:
- **Skill name**: Which skill to evaluate (or `--all` for all)
- **Mode**: `eval` (default), `benchmark`, `compare`, or `obsolescence`

If no arguments provided, show usage help with the command table above.

### 2. Discover Eval Cases

For each skill being evaluated:

1. Read the suite config at `skills/{skill}/evals/eval.yaml`
2. Check for per-repo overlay at `.claude/evals/{skill}/eval.yaml` (overrides `default_scoring_method`, `min_pass_rate`; unions case lists; same ID = per-repo wins)
3. Glob case files matching `include` patterns, excluding `exclude` patterns
4. Parse each case file against `eval-case.schema.yaml`

If a skill has no `evals/` directory, skip it with a warning.

### 3. Execute Cases

For each eval case, run in an isolated context:

1. **Setup**: Load any `context_files` as fixtures
2. **Execution**: Send the case `prompt` to a Task agent with:
   - The skill's SKILL.md injected as context (for `eval`/`benchmark` mode)
   - No skill context for baseline runs (`compare` arm B, `obsolescence` mode)
3. **Capture**: Record the agent's output, tool calls, and files created

**Timeout**: Use case-level `timeout_seconds` or suite default. Kill the agent if exceeded.

### 4. Score Results

Apply the scoring method specified in each case:

#### Binary Scoring
- Evaluate `pass_condition` against the captured output
- Score: 1.0 (pass) or 0.0 (fail)

#### Rubric Scoring
- Launch a judge Task agent for each dimension
- Judge receives: the original prompt, the agent's output, and the dimension's pass/fail criteria
- Judge returns a score (0.0-1.0) and rationale
- Weighted average across dimensions = final score
- Pass threshold: score >= 0.7

#### LLM-Judge Scoring
- Launch a judge Task agent with custom `judge_prompt` and `judge_rubric`
- Judge returns a score (0.0-1.0) and rationale

### 5. Run Assertions

Assertions are always mechanical (no LLM). For each assertion:

| Type | Check |
|------|-------|
| `output_contains` | Output includes the string |
| `no_output_contains` | Output does NOT include the string |
| `output_matches_regex` | Output matches the regex pattern |
| `tool_called` | The named tool was invoked |
| `no_tool_called` | The named tool was NOT invoked |
| `file_created` | The specified file was created |
| `file_not_modified` | The specified file was not changed |

A case fails if ANY assertion fails, regardless of scoring result.

### 6. Aggregate Results

Collect all case results into a result object following `eval-result.schema.json`:

- `pass_rate`: fraction of cases with status "pass"
- `mean_score`: average score across all cases
- `status`: "pass" if pass_rate >= `min_pass_rate`, else "fail"

### 7. Mode-Specific Processing

#### Benchmark Mode (`--benchmark`)

After aggregation:
1. Load previous benchmark data from `.claude/artifacts/benchmarks/{skill}.jsonl`
2. Calculate `benchmark_delta` (trend vs previous run)
3. Append current summary as a new JSONL line
4. Report trend: improving, stable, or degrading

#### Compare Mode (`--compare`)

1. Run all cases WITH the skill loaded (arm A)
2. Run all cases WITHOUT the skill — bare prompt to fresh agent (arm B)
3. Score both arms identically
4. Blind comparison: arms labeled "Alpha"/"Beta" with randomized assignment
5. Calculate per-case and aggregate uplift
6. Verdict: `skill-wins` if skill arm is significantly better, `baseline-wins` if worse, `tie` if similar

#### Obsolescence Mode (`--obsolescence`)

1. Filter to skills with `type: capability-uplift` in their SKILL.md frontmatter
2. Run each skill's evals WITHOUT the skill loaded
3. Classify based on baseline pass rate:
   - **obsolete**: baseline >= 0.9 (model has absorbed this capability)
   - **marginal**: baseline >= 0.7 (model partially handles it)
   - **valuable**: baseline < 0.7 (skill still adds significant value)
4. Report table with verdicts and recommendations

### 8. Report

Output a human-readable summary table:

```
## Skill Eval Results: {skill-name}

| Case | Status | Score | Method | Duration |
|------|--------|-------|--------|----------|
| happy-path-basic | PASS | 0.92 | rubric | 12.3s |
| edge-case-empty | PASS | 1.00 | binary | 4.1s |
| complex-multi-step | FAIL | 0.45 | rubric | 28.7s |

**Pass Rate**: 2/3 (66.7%)
**Mean Score**: 0.79
**Status**: FAIL (min_pass_rate: 0.8)
```

For compare mode, add uplift columns. For obsolescence mode, add verdict column.

## Skill Type Classification

Skills can optionally declare a `type` in their SKILL.md frontmatter:

| Type | Description | Obsolescence Candidate? |
|------|-------------|------------------------|
| `capability-uplift` | Teaches model something it can't do alone | Yes |
| `encoded-preference` | Encodes team/org preferences and conventions | No |
| `unknown` | Not yet classified (default) | No |

## Eval Suite Config Reference

Each skill's `evals/eval.yaml`:

```yaml
suite:
  skill: string              # skill name
  version: string            # suite version
  type: "capability-uplift" | "encoded-preference"  # skill classification
  default_scoring_method: "rubric"    # default for cases without explicit method
  default_timeout_seconds: 120        # default per-case timeout
  min_pass_rate: 0.8                  # ratchet integration threshold
  include: ["*.yaml"]                 # case file globs
  exclude: ["wip-*.yaml"]            # exclusion globs
  fixtures_dir: "fixtures/"           # fixture file directory
  benchmark:
    enabled: boolean                  # whether benchmarking is active
    data_file: ".claude/artifacts/benchmarks/{skill-name}.jsonl"
```

## Ratchet Integration

When `/skill-eval --benchmark` runs, the pass rate is tracked in `.quality-baseline.json` under the `skill_eval` namespace. The quality ratchet ensures per-skill pass rates never decrease.

## Error Handling

- **No eval suite**: Skip skill, warn user
- **Case parse error**: Mark case as `error`, continue with remaining cases
- **Agent timeout**: Mark case as `timeout`, score as 0.0
- **Judge failure**: Mark case as `error`, include error details
- **All cases error**: Report status as `error` with aggregated error info

## Instructions for AI

When executing this skill:

1. **Parse mode first** — Determine eval/benchmark/compare/obsolescence from args
2. **Discover cases** — Read eval.yaml, resolve overlays, glob case files
3. **Execute sequentially** — Run each case one at a time to avoid resource contention
4. **Score independently** — Scoring judges must not see other case results
5. **Report clearly** — Use tables for results, highlight failures
6. **Respect timeouts** — Kill long-running cases at the timeout boundary
7. **Emit JSON** — Write eval-result.schema.json to `.claude/artifacts/eval-results/{skill}-{timestamp}.json`
