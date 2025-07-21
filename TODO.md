The GitLab MCP server lacks runner management functions. Here's the TODO list for implementing runner management:

TODO: GitLab MCP Runner Management Implementation

🔴 High Priority - Core Runner Functions

1. Add get_project_runners function - List all runners available to a project
2. Add list_shared_runners function - List GitLab instance shared runners
3. Add get_runner_details function - Get detailed info about specific runner

🟡 Medium Priority - Runner Control Functions

4. Add enable_project_runner function - Enable a runner for a project
5. Add disable_project_runner function - Disable a runner for a project
6. Add register_runner function - Register new runner with project
7. Update pipeline creation to validate runner tags exist - Prevent invalid tag errors

🟢 Low Priority - Advanced Runner Features

7. Add update_runner_settings function - Modify runner configuration
8. Add get_runner_jobs function - List jobs executed by a runner
9. Add runner_health_check function - Check runner status and availability
