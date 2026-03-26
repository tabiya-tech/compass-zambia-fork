# Career Readiness Modules — Authoring Guide

This guide explains how to add a new career readiness module.

## File Structure

Each module is a single Markdown file in this directory (e.g., `my_new_module.md`).
Files starting with `_` are ignored by the loader.

## Required Frontmatter

Every module file must start with a YAML frontmatter block:

```yaml
---
id: my-new-module
title: My New Module
description: A short description shown in the module list.
icon: module-icon
sort_order: 6
input_placeholder: Ask about this topic...
topics: Topic One, Topic Two, Topic Three
---
```

| Field | Description |
|-------|-------------|
| `id` | Unique slug identifier (kebab-case). Must not conflict with existing modules. |
| `title` | Display name shown to the user. |
| `description` | Short summary shown in the module list. |
| `icon` | Icon identifier used by the frontend. |
| `sort_order` | Integer controlling the display order of modules in the list. |
| `input_placeholder` | Placeholder text in the chat input box. |
| `topics` | Comma-separated list of topics the AI tutor must cover before the quiz is triggered. |

## Grounding Content

After the frontmatter, write the educational content using Markdown headings.
Organize content with H2 sections (`##`) that correspond to your topics list.
This content is what the AI tutor uses as its knowledge base — it will not invent facts beyond this material.

## Quiz Section

Add a `## Quiz` section at the bottom of the file. This section is **not** shown to the AI tutor.

Format:

```markdown
## Quiz
pass_threshold: 0.7

1. Question text?
A. Option A
B. Option B
C. Option C
D. Option D
Answer: B

2. Another question?
A. Option A
B. Option B
C. Option C
D. Option D
Answer: C
```

- `pass_threshold` (optional, defaults to `0.7`) — fraction of correct answers needed to pass.
- Include at least 5 questions; we recommend 10.
- Each question has exactly 4 options (A–D) and one correct `Answer:` line.

## Module Ordering

All modules are accessible from the start — there is no sequential unlock. The `sort_order` field controls the display order in the module list.

## Checklist Before Deploying

1. Frontmatter has all required fields
2. `id` is unique and uses kebab-case
3. `sort_order` does not conflict with existing modules
4. `topics` list matches the content sections
5. `## Quiz` section has correctly formatted questions with `Answer:` lines
6. Content is factually accurate and appropriate for the target audience
7. Run `poetry run pytest app/career_readiness/test_module_loader.py -v` to verify parsing

## Example

See `_example_module.md` for a complete template.
