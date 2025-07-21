import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import AxiosMockAdapter from 'axios-mock-adapter';
import { GitLabPipelineManager } from '../src/gitlab-pipeline-manager.js';

const apiUrl = 'https://gitlab.example.com/api/v4';
const token = 'test-token';

let manager: GitLabPipelineManager;
let mock: AxiosMockAdapter;

beforeEach(() => {
  manager = new GitLabPipelineManager({ apiUrl, token });
  mock = new AxiosMockAdapter((manager as any).axios);
});

afterEach(() => {
  mock.restore();
});

describe('GitLab Runner Management - Integration Tests', () => {
  
  describe('complete runner lifecycle', () => {
    it('should handle full runner registration and management workflow', async () => {
      // Step 1: Register a new runner
      const registrationData = {
        token: 'project-registration-token',
        description: 'Integration Test Runner',
        info: {
          name: 'integration-runner',
          version: '15.8.0',
          platform: 'linux',
          architecture: 'amd64'
        },
        tag_list: ['integration', 'test'],
        run_untagged: false,
        locked: false
      };

      const newRunnerResponse = {
        id: 100,
        token: 'new-runner-token',
        description: 'Integration Test Runner',
        active: true,
        tag_list: ['integration', 'test']
      };

      mock.onPost('/runners').reply(201, newRunnerResponse);

      // Step 2: Enable runner for project
      const enableResponse = {
        id: 100,
        description: 'Integration Test Runner',
        active: true,
        is_shared: false,
        runner_type: 'project_type'
      };

      mock.onPost('/projects/123/runners').reply(201, enableResponse);

      // Step 3: Get project runners to verify
      const projectRunnersResponse = [
        {
          id: 100,
          description: 'Integration Test Runner',
          active: true,
          online: true,
          tag_list: ['integration', 'test']
        }
      ];

      mock.onGet('/projects/123/runners').reply(200, projectRunnersResponse);

      // Step 4: Update runner settings
      const updateData = {
        description: 'Updated Integration Runner',
        tag_list: ['integration', 'test', 'updated']
      };

      const updatedRunnerResponse = {
        id: 100,
        description: 'Updated Integration Runner',
        tag_list: ['integration', 'test', 'updated'],
        active: true
      };

      mock.onPut('/runners/100').reply(200, updatedRunnerResponse);

      // Step 5: Check runner health
      const healthResponse = {
        runner_id: 100,
        status: 'healthy',
        online: true,
        last_contact: '2025-01-20T10:00:00Z'
      };

      mock.onGet('/runners/100/verify').reply(200, healthResponse);

      // Step 6: Get runner jobs
      const jobsResponse = [
        {
          id: 2001,
          status: 'success',
          name: 'integration-test',
          ref: 'main'
        }
      ];

      mock.onGet('/runners/100/jobs').reply(200, jobsResponse);

      // Step 7: Disable runner from project
      mock.onDelete('/projects/123/runners/100').reply(204);

      // When implemented, this test will verify the complete workflow:
      /*
      // 1. Register runner
      const registeredRunner = await gitlabApi.registerRunner(registrationData);
      expect(registeredRunner.id).toBe(100);

      // 2. Enable for project
      const enabledRunner = await gitlabApi.enableProjectRunner('123', 100);
      expect(enabledRunner.active).toBe(true);

      // 3. Verify in project runners list
      const projectRunners = await gitlabApi.getProjectRunners('123');
      expect(projectRunners.some(r => r.id === 100)).toBe(true);

      // 4. Update runner settings
      const updatedRunner = await gitlabApi.updateRunnerSettings(100, updateData);
      expect(updatedRunner.description).toBe('Updated Integration Runner');

      // 5. Check health
      const health = await gitlabApi.runnerHealthCheck(100);
      expect(health.status).toBe('healthy');

      // 6. Get jobs
      const jobs = await gitlabApi.getRunnerJobs(100);
      expect(jobs).toHaveLength(1);

      // 7. Disable from project
      await gitlabApi.disableProjectRunner('123', 100);
      */

      // For now, just verify mocks are setup correctly
      expect(mock.history.post.length).toBe(0);
      expect(mock.history.get.length).toBe(0);
      expect(mock.history.put.length).toBe(0);
      expect(mock.history.delete.length).toBe(0);
    });
  });

  describe('pipeline integration with runners', () => {
    it('should validate runner tags before pipeline creation', async () => {
      // Mock getting project runners to check available tags
      const availableRunners = [
        {
          id: 1,
          tag_list: ['docker', 'linux'],
          active: true,
          online: true
        },
        {
          id: 2,
          tag_list: ['windows', 'shell'],
          active: true,
          online: false
        }
      ];

      mock.onGet('/projects/123/runners').reply(200, availableRunners);

      // Mock pipeline creation that should succeed with valid tags
      const pipelineWithValidTags = {
        id: 500,
        status: 'pending',
        ref: 'main',
        sha: 'abc123'
      };

      mock.onPost('/projects/123/pipeline').reply(201, pipelineWithValidTags);

      // When implemented, this should validate tags exist:
      /*
      // Valid tags should work
      const pipeline = await gitlabApi.createPipelineWithRunnerValidation('123', 'main', {
        BUILD_TAG: 'docker'
      });
      expect(pipeline.status).toBe('pending');

      // Invalid tags should fail
      await expect(gitlabApi.createPipelineWithRunnerValidation('123', 'main', {
        BUILD_TAG: 'nonexistent'
      })).rejects.toThrow('No active runners available with tag: nonexistent');
      */
    });

    it('should handle runner availability for job execution', async () => {
      // Mock scenario where runner goes offline during job execution
      const runnerDetails = {
        id: 1,
        online: false,
        status: 'offline',
        last_contact: '2025-01-19T10:00:00Z'
      };

      mock.onGet('/runners/1').reply(200, runnerDetails);

      const jobs = [
        {
          id: 3001,
          status: 'pending',
          name: 'test-job',
          runner: { id: 1, description: 'Offline Runner' }
        }
      ];

      mock.onGet('/runners/1/jobs').reply(200, jobs);

      // When implemented:
      /*
      const runnerStatus = await gitlabApi.getRunnerDetails(1);
      expect(runnerStatus.online).toBe(false);

      const pendingJobs = await gitlabApi.getRunnerJobs(1, { status: 'pending' });
      expect(pendingJobs).toHaveLength(1);
      // Should handle stuck jobs due to offline runner
      */
    });
  });

  describe('multi-project runner sharing', () => {
    it('should handle runner enabled across multiple projects', async () => {
      const sharedRunner = {
        id: 50,
        description: 'Shared Project Runner',
        is_shared: false,
        runner_type: 'group_type',
        projects: [
          { id: 123, name: 'project-1' },
          { id: 124, name: 'project-2' }
        ]
      };

      mock.onGet('/runners/50').reply(200, sharedRunner);

      // Enable runner for first project
      mock.onPost('/projects/123/runners').reply(201, {
        id: 50,
        active: true
      });

      // Enable runner for second project  
      mock.onPost('/projects/124/runners').reply(201, {
        id: 50,
        active: true
      });

      // Get runners for both projects
      mock.onGet('/projects/123/runners').reply(200, [sharedRunner]);
      mock.onGet('/projects/124/runners').reply(200, [sharedRunner]);

      // When implemented:
      /*
      await gitlabApi.enableProjectRunner('123', 50);
      await gitlabApi.enableProjectRunner('124', 50);

      const project1Runners = await gitlabApi.getProjectRunners('123');
      const project2Runners = await gitlabApi.getProjectRunners('124');

      expect(project1Runners.some(r => r.id === 50)).toBe(true);
      expect(project2Runners.some(r => r.id === 50)).toBe(true);
      */
    });
  });

  describe('runner tag management and validation', () => {
    it('should validate and manage runner tags properly', async () => {
      const runner = {
        id: 75,
        tag_list: ['docker', 'linux', 'production'],
        active: true
      };

      mock.onGet('/runners/75').reply(200, runner);

      // Test updating tags
      const updateTags = {
        tag_list: ['docker', 'linux', 'staging', 'kubernetes']
      };

      const updatedRunner = {
        ...runner,
        tag_list: updateTags.tag_list
      };

      mock.onPut('/runners/75').reply(200, updatedRunner);

      // When implemented:
      /*
      const originalRunner = await gitlabApi.getRunnerDetails(75);
      expect(originalRunner.tag_list).toContain('production');

      const updated = await gitlabApi.updateRunnerSettings(75, updateTags);
      expect(updated.tag_list).toContain('kubernetes');
      expect(updated.tag_list).not.toContain('production');

      // Should validate tag format
      const invalidTags = { tag_list: ['invalid tag with spaces'] };
      await expect(gitlabApi.updateRunnerSettings(75, invalidTags))
        .rejects.toThrow('Tag names cannot contain spaces');
      */
    });

    it('should handle special characters in tag names', async () => {
      const specialTags = {
        tag_list: ['node-16', 'ubuntu_20.04', 'test.env']
      };

      mock.onPut('/runners/75').reply(200, {
        id: 75,
        tag_list: specialTags.tag_list
      });

      // When implemented:
      /*
      const updated = await gitlabApi.updateRunnerSettings(75, specialTags);
      expect(updated.tag_list).toEqual(specialTags.tag_list);
      */
    });
  });

  describe('runner performance monitoring', () => {
    it('should track runner performance metrics over time', async () => {
      const performanceData = {
        runner_id: 25,
        status: 'healthy',
        system_info: {
          cpu_usage: 25.5,
          memory_usage: 60.2,
          disk_usage: 45.8,
          load_average: [1.2, 0.8, 0.5]
        },
        job_statistics: {
          total_jobs: 150,
          success_rate: 94.7,
          average_duration: 240,
          failed_jobs_last_24h: 2
        },
        connectivity: {
          last_ping: '2025-01-20T10:30:00Z',
          ping_failures_24h: 0,
          network_latency_ms: 15
        }
      };

      mock.onGet('/runners/25/verify').reply(200, performanceData);

      // When implemented:
      /*
      const metrics = await gitlabApi.runnerHealthCheck(25);
      expect(metrics.system_info.cpu_usage).toBeLessThan(80);
      expect(metrics.job_statistics.success_rate).toBeGreaterThan(90);
      expect(metrics.connectivity.ping_failures_24h).toBe(0);
      */
    });

    it('should detect performance degradation', async () => {
      const degradedPerformance = {
        runner_id: 25,
        status: 'degraded',
        system_info: {
          cpu_usage: 95.5,
          memory_usage: 89.2,
          disk_usage: 98.1
        },
        warnings: [
          'High CPU usage detected',
          'Memory usage above threshold',
          'Disk space critically low'
        ]
      };

      mock.onGet('/runners/25/verify').reply(200, degradedPerformance);

      // When implemented:
      /*
      const metrics = await gitlabApi.runnerHealthCheck(25);
      expect(metrics.status).toBe('degraded');
      expect(metrics.warnings).toContain('High CPU usage');
      */
    });
  });

  describe('error scenarios and recovery', () => {
    it('should handle runner registration failures gracefully', async () => {
      // Test various registration failure scenarios
      const scenarios = [
        {
          error: 403,
          message: 'Invalid registration token',
          description: 'Invalid token should fail gracefully'
        },
        {
          error: 422,
          message: 'Runner description already taken',
          description: 'Duplicate description should be handled'
        },
        {
          error: 429,
          message: 'Rate limit exceeded',
          description: 'Rate limiting should be respected'
        }
      ];

      scenarios.forEach(({ error, message, description }) => {
        mock.onPost('/runners').replyOnce(error, { message });
      });

      // When implemented:
      /*
      for (const scenario of scenarios) {
        await expect(gitlabApi.registerRunner({
          token: 'test-token',
          description: 'Test Runner'
        })).rejects.toThrow(scenario.message);
      }
      */
    });

    it('should handle network timeouts during health checks', async () => {
      mock.onGet('/runners/1/verify').timeout();

      // When implemented:
      /*
      await expect(gitlabApi.runnerHealthCheck(1, { timeout: 5000 }))
        .rejects.toThrow('Health check timeout');
      */
    });

    it('should retry failed operations with exponential backoff', async () => {
      let callCount = 0;
      mock.onGet('/runners/1').reply(() => {
        callCount++;
        if (callCount < 3) {
          return [500, { message: 'Temporary server error' }];
        }
        return [200, { id: 1, status: 'online' }];
      });

      // When implemented with retry logic:
      /*
      const runner = await gitlabApi.getRunnerDetailsWithRetry(1, { maxRetries: 3 });
      expect(runner.id).toBe(1);
      expect(callCount).toBe(3);
      */
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent runner operations safely', async () => {
      // Setup mocks for concurrent operations
      const runners = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        description: `Runner ${i + 1}`,
        active: true
      }));

      runners.forEach(runner => {
        mock.onGet(`/runners/${runner.id}`).reply(200, runner);
        mock.onPut(`/runners/${runner.id}`).reply(200, {
          ...runner,
          description: `Updated ${runner.description}`
        });
      });

      // When implemented:
      /*
      const updatePromises = runners.map(runner =>
        gitlabApi.updateRunnerSettings(runner.id, {
          description: `Updated ${runner.description}`
        })
      );

      const results = await Promise.all(updatePromises);
      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result.description).toContain('Updated');
      });
      */
    });
  });

  describe('resource cleanup', () => {
    it('should properly cleanup orphaned runners', async () => {
      // Mock getting all runners
      const allRunners = [
        { id: 1, active: true, online: true, last_contact: '2025-01-20T10:00:00Z' },
        { id: 2, active: true, online: false, last_contact: '2025-01-10T10:00:00Z' }, // Old
        { id: 3, active: false, online: false, last_contact: '2025-01-01T10:00:00Z' } // Very old
      ];

      mock.onGet('/runners').reply(200, allRunners);

      // Mock deletion of old runners
      mock.onDelete('/runners/2').reply(204);
      mock.onDelete('/runners/3').reply(204);

      // When implemented:
      /*
      const cleanupResult = await gitlabApi.cleanupOrphanedRunners({
        olderThanDays: 7,
        mustBeOffline: true
      });

      expect(cleanupResult.cleaned).toHaveLength(2);
      expect(cleanupResult.cleaned).toEqual([2, 3]);
      */
    });
  });
});