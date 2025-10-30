---
id: TASK-ea16dbc
title: Phase 1: CLI Documentation (cli-reference.md, CLAUDE.md, scripts/README.md)
type: task
task_type: docs
status: DONE
priority: high
created: 2025-10-30T08:53:25Z
updated: 2025-10-30T08:59:48Z
assignee: scrum-master
epic: EPIC-0db52c8
dependencies: []
---

# TASK-ea16dbc: Phase 1: CLI Documentation (cli-reference.md, CLAUDE.md, scripts/README.md)

## Description

Create comprehensive CLI documentation using Hybrid Approach (Skills + Scripts):
1. Workflow-focused guide (cli-reference.md) - WHEN and WHY
2. Technical reference (scripts/README.md) - HOW (full syntax)
3. Update CLAUDE.md with CLI tools overview

## Requirements

- [x] Create .pioneer/workflow/cli-reference.md (~200-300 lines)
  - Quick Start (Skills vs Scripts)
  - Common workflows (9 scenarios)
  - Link to scripts/README.md
- [x] Create .pioneer/scripts/README.md (complete reference)
  - All epic-manager.sh commands
  - All task-manager.sh commands
  - Examples, troubleshooting, advanced usage
- [x] Update CLAUDE.md
  - Add "CLI 도구" section after "워크플로우"
  - Skills examples (Phase 2 placeholder)
  - CLI Scripts examples
  - Links to both documentation files

## Tech Spec

### Design Overview

Create two complementary documentation files:

**1. cli-reference.md** (Workflow-focused):
- Target audience: All users (Claude, developers)
- Focus: WHEN to use which tool, WHY workflows exist
- Structure: Common scenarios with Skills and CLI examples side-by-side
- Length: ~200-300 lines
- Cross-reference: Links to scripts/README.md for detailed syntax

**2. scripts/README.md** (Technical reference):
- Target audience: Advanced users, automation scripts
- Focus: HOW to use commands (complete syntax)
- Structure: Command-by-command documentation
- Length: ~800-1000 lines (comprehensive)
- Includes: All parameters, examples, troubleshooting, auto-sync features

**3. CLAUDE.md update**:
- Add new section "🔧 CLI 도구" after "📋 워크플로우"
- Show both Skills and CLI approaches
- Link to both cli-reference.md and scripts/README.md
- Skills examples use natural language (Phase 2 will create actual Skills)

### File Structure

```
.pioneer/
├── workflow/
│   └── cli-reference.md          # NEW: Workflow guide
├── scripts/
│   ├── README.md                 # NEW: Technical reference
│   ├── epic-manager.sh           # Existing
│   └── task-manager.sh           # Existing
└── skills/                       # Phase 2 (placeholder in docs)

CLAUDE.md                         # UPDATED: Add CLI section
```

### Content Organization

**cli-reference.md sections**:
1. Quick Start (Skills vs Scripts)
2. Common Workflows (9 scenarios)
   - Starting new Epic
   - Creating Tasks
   - Working on Task
   - Checking progress
   - Creating PR
   - Handling feedback
   - Completing Epic
   - Listing work
   - Blocking tasks
3. When to use Skills vs CLI
4. Status/Type reference (summary)
5. Troubleshooting (common issues)

**scripts/README.md sections**:
1. Overview
2. epic-manager.sh (all commands)
3. task-manager.sh (all commands)
4. Environment variables
5. Auto-sync features (detailed)
6. File format specifications
7. Troubleshooting (detailed)
8. Advanced usage (scripting, CI/CD)
9. Best practices

### Writing Style

- cli-reference.md: Conversational, example-driven
- scripts/README.md: Technical, reference-style
- Both: Clear examples, copy-pasteable commands

## Work Log

### 2025-10-30 08:53 - scrum-master
- Task created

### 2025-10-30 09:00 - developer
- Created .pioneer/workflow/cli-reference.md (286 lines)
  - Quick Start section comparing Skills vs CLI Scripts
  - 9 common workflows with both Skills and CLI examples
  - Status/Type reference tables
  - Troubleshooting section
  - Links to scripts/README.md
- Created .pioneer/scripts/README.md (1,019 lines)
  - Complete epic-manager.sh command reference (8 commands)
  - Complete task-manager.sh command reference (6 commands)
  - Environment variables documentation
  - Auto-sync features (Epic progress, status, PR body)
  - File format specifications
  - Comprehensive troubleshooting (8 scenarios)
  - Advanced usage (scripting examples, Git hooks, CI/CD)
  - Best practices section
- Updated CLAUDE.md
  - Added "🔧 CLI 도구" section after "C4 Model" section
  - Documented Skills approach (Phase 2 placeholder)
  - Documented CLI Scripts approach with examples
  - "When to use what" guidelines
  - Links to cli-reference.md and scripts/README.md

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 08:53 | TODO | scrum-master | Task created |
| 2025-10-30 08:53 | IN_PROGRESS | developer | Phase 1 문서 작성 시작 |
| 2025-10-30 08:59 | READY_FOR_COMMIT | scrum-master | Phase 1 문서 작성 완료 |
| 2025-10-30 08:59 | DONE | scrum-master | Phase 1 커밋 완료 |

## Artifacts

- Branch: feature/EPIC-0db52c8
- Commit: (pending - scrum-master will commit)
- Files Modified:
  - .pioneer/workflow/cli-reference.md (created)
  - .pioneer/scripts/README.md (created)
  - CLAUDE.md (updated)

## Checklist

- [x] Work completed (Developer)
- [x] Build succeeded (N/A - documentation only)

