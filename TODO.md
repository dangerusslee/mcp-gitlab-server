# GitLab MCP Server Runner Issues - TODO for Claude

## 🚨 Issue Summary

The @dangerusslee/gitlab-mcp-server v0.3.1 has persistent schema validation issues with runner-related endpoints.

## ❌ Failing Functions

### 1. `mcp__gitlab__get_project_runners`

**Error**: Schema validation failures for required fields

- Missing: `architecture`, `platform`, `contacted_at`, `version`, `revision`
- Missing: `tag_list`, `run_untagged`, `locked`, `maximum_timeout`, `access_level`
- Status enum mismatch: API returns `"paused"` but schema expects: `'online' | 'offline' | 'stale' | 'never_contacted' | 'not_connected'`

### 2. `mcp__gitlab__list_shared_runners`

**Status**: Returns empty array (may be permission/scope related)

### 3. `mcp__gitlab__runner_health_check`

**Error**: "Runner not found" (expected without valid runner ID)

## 🔍 Root Cause Analysis

The MCP server's TypeScript schema definitions don't match GitLab's actual API responses for runners:

1. **Missing Optional Fields**: GitLab API may not return all fields that MCP schema marks as required
2. **Status Enum Mismatch**: GitLab returns additional status values like `"paused"`
3. **API Version Differences**: Schema may be based on older GitLab API version

## 🛠️ Proposed Solution

**For @dangerusslee/gitlab-mcp-server maintainer:**

1. Update runner schemas to make fields optional where GitLab API doesn't guarantee them
2. Expand status enum to include `"paused"` and other valid GitLab runner statuses
3. Test against latest GitLab API (v4) responses
4. Consider using `Partial<>` types for runner response validation

## ✅ What Works (v0.3.1)

- ✅ Projects: list, search, get details
- ✅ Pipelines: list, get details, jobs
- ✅ CI/CD: YAML validation, pipeline operations
- ✅ Files: get contents, create/update files
- ✅ Issues, MRs, commits, branches

## 📋 Action Items

1. **Report to @dangerusslee**: Submit GitHub issue with schema validation errors
2. **Temporary Workaround**: Use direct GitLab API calls for runner management
3. **Alternative**: Consider using GitLab CLI (`glab`) for runner operations
4. **Monitor**: Watch for v0.3.2+ releases with runner fixes

## 🔗 Relevant Links

- Package: https://www.npmjs.com/package/@dangerusslee/gitlab-mcp-server
- GitLab Runners API: https://docs.gitlab.com/ee/api/runners.html
- Issue Template: Schema validation errors for runner endpoints in v0.3.1

---

_Generated: 2025-07-21_
_MCP Server Version: @dangerusslee/gitlab-mcp-server@0.3.1_
