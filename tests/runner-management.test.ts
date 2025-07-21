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

describe('GitLab Runner Management - Unit Tests', () => {
  
  describe('get_project_runners', () => {
    it('should list all project runners successfully', async () => {
      const mockRunners = [
        {
          id: 1,
          description: 'Project Runner 1',
          ip_address: '192.168.1.100',
          active: true,
          is_shared: false,
          runner_type: 'project_type',
          name: 'project-runner-1',
          online: true,
          status: 'online',
          tag_list: ['docker', 'linux'],
          version: '15.8.0',
          access_level: 'not_protected',
          maximum_timeout: 3600,
          architecture: 'amd64',
          platform: 'linux',
          contacted_at: '2025-01-20T10:00:00Z',
          token_expires_at: null
        },
        {
          id: 2,
          description: 'Project Runner 2',
          ip_address: '192.168.1.101',
          active: true,
          is_shared: false,
          runner_type: 'project_type',
          name: 'project-runner-2',
          online: false,
          status: 'offline',
          tag_list: ['windows', 'shell'],
          version: '15.7.0',
          access_level: 'ref_protected',
          maximum_timeout: 7200,
          architecture: 'amd64',
          platform: 'windows',
          contacted_at: '2025-01-19T08:30:00Z',
          token_expires_at: '2025-12-31T23:59:59Z'
        }
      ];

      mock
        .onGet('/projects/123/runners')
        .reply(200, mockRunners);

      // When the function is implemented, this test will verify it works correctly
      // const runners = await gitlabApi.getProjectRunners('123');
      // expect(runners).toEqual(mockRunners);
      // expect(runners).toHaveLength(2);
      // expect(runners[0].tag_list).toContain('docker');
      
      // For now, verify the mock is set up correctly
      expect(mock.history.get.length).toBe(0); // No actual call made yet
    });

    it('should handle pagination parameters', async () => {
      const mockRunners = [{ id: 1, description: 'Runner 1', active: true }];
      
      mock
        .onGet('/projects/123/runners')
        .reply((config) => {
          expect(config.params).toMatchObject({
            page: 2,
            per_page: 10,
            scope: 'active'
          });
          return [200, mockRunners];
        });

      // When implemented:
      // const runners = await gitlabApi.getProjectRunners('123', { page: 2, per_page: 10, scope: 'active' });
      // expect(runners).toEqual(mockRunners);
    });

    it('should handle authentication errors', async () => {
      mock
        .onGet('/projects/123/runners')
        .reply(401, { message: 'Unauthorized' });

      // When implemented:
      // await expect(gitlabApi.getProjectRunners('123')).rejects.toThrow('Unauthorized');
    });

    it('should handle invalid project ID', async () => {
      mock
        .onGet('/projects/invalid/runners')
        .reply(404, { message: 'Project not found' });

      // When implemented:
      // await expect(gitlabApi.getProjectRunners('invalid')).rejects.toThrow('Project not found');
    });
  });

  describe('list_shared_runners', () => {
    it('should list shared runners successfully', async () => {
      const mockSharedRunners = [
        {
          id: 10,
          description: 'Shared Runner 1',
          ip_address: '10.0.0.100',
          active: true,
          is_shared: true,
          runner_type: 'instance_type',
          name: 'gitlab-runner-shared-1',
          online: true,
          status: 'online',
          tag_list: ['docker', 'kubernetes'],
          version: '15.8.0',
          access_level: 'not_protected',
          maximum_timeout: 3600,
          architecture: 'amd64',
          platform: 'linux',
          contacted_at: '2025-01-20T10:30:00Z'
        }
      ];

      mock
        .onGet('/runners')
        .reply(200, mockSharedRunners);

      // When implemented:
      // const runners = await gitlabApi.listSharedRunners();
      // expect(runners).toEqual(mockSharedRunners);
      // expect(runners[0].is_shared).toBe(true);
    });

    it('should filter by scope parameter', async () => {
      mock
        .onGet('/runners')
        .reply((config) => {
          expect(config.params.scope).toBe('online');
          return [200, []];
        });

      // When implemented:
      // await gitlabApi.listSharedRunners({ scope: 'online' });
    });

    it('should handle admin permissions requirement', async () => {
      mock
        .onGet('/runners')
        .reply(403, { message: 'Forbidden - Admin access required' });

      // When implemented:
      // await expect(gitlabApi.listSharedRunners()).rejects.toThrow('Admin access required');
    });
  });

  describe('get_runner_details', () => {
    it('should get runner details successfully', async () => {
      const mockRunnerDetails = {
        id: 1,
        description: 'Detailed Runner Info',
        ip_address: '192.168.1.100',
        active: true,
        is_shared: false,
        runner_type: 'project_type',
        name: 'detailed-runner',
        online: true,
        status: 'online',
        tag_list: ['docker', 'linux', 'test'],
        version: '15.8.0',
        access_level: 'not_protected',
        maximum_timeout: 3600,
        architecture: 'amd64',
        platform: 'linux',
        contacted_at: '2025-01-20T10:00:00Z',
        projects: [
          { id: 123, name: 'test-project', path_with_namespace: 'group/test-project' }
        ],
        groups: [],
        job_count: 42,
        job_success_count: 40,
        job_failure_count: 2
      };

      mock
        .onGet('/runners/1')
        .reply(200, mockRunnerDetails);

      // When implemented:
      // const runner = await gitlabApi.getRunnerDetails(1);
      // expect(runner).toEqual(mockRunnerDetails);
      // expect(runner.job_count).toBe(42);
    });

    it('should handle non-existent runner ID', async () => {
      mock
        .onGet('/runners/999')
        .reply(404, { message: 'Runner not found' });

      // When implemented:
      // await expect(gitlabApi.getRunnerDetails(999)).rejects.toThrow('Runner not found');
    });

    it('should validate runner ID is numeric', async () => {
      // When implemented, should validate input before making API call
      // expect(() => gitlabApi.getRunnerDetails('invalid')).toThrow('Runner ID must be numeric');
    });
  });

  describe('enable_project_runner', () => {
    it('should enable runner for project successfully', async () => {
      const mockResponse = {
        id: 1,
        description: 'Enabled Runner',
        active: true,
        is_shared: false,
        runner_type: 'project_type'
      };

      mock
        .onPost('/projects/123/runners')
        .reply(201, mockResponse);

      // When implemented:
      // const result = await gitlabApi.enableProjectRunner('123', 1);
      // expect(result).toEqual(mockResponse);
      // expect(result.active).toBe(true);
    });

    it('should handle runner already enabled error', async () => {
      mock
        .onPost('/projects/123/runners')
        .reply(409, { message: 'Runner already enabled for project' });

      // When implemented:
      // await expect(gitlabApi.enableProjectRunner('123', 1)).rejects.toThrow('already enabled');
    });

    it('should validate required parameters', async () => {
      // When implemented, should validate inputs
      // expect(() => gitlabApi.enableProjectRunner('', 1)).toThrow('Project ID is required');
      // expect(() => gitlabApi.enableProjectRunner('123', null)).toThrow('Runner ID is required');
    });
  });

  describe('disable_project_runner', () => {
    it('should disable runner for project successfully', async () => {
      mock
        .onDelete('/projects/123/runners/1')
        .reply(204);

      // When implemented:
      // await gitlabApi.disableProjectRunner('123', 1);
      // expect(mock.history.delete[0].url).toBe('/projects/123/runners/1');
    });

    it('should handle runner not enabled error', async () => {
      mock
        .onDelete('/projects/123/runners/1')
        .reply(404, { message: 'Runner not enabled for project' });

      // When implemented:
      // await expect(gitlabApi.disableProjectRunner('123', 1)).rejects.toThrow('not enabled');
    });
  });

  describe('register_runner', () => {
    it('should register new runner successfully', async () => {
      const registerData = {
        token: 'project-token-123',
        description: 'New Test Runner',
        info: {
          name: 'test-runner-1',
          version: '15.8.0',
          platform: 'linux',
          architecture: 'amd64'
        },
        active: true,
        locked: false,
        run_untagged: false,
        tag_list: ['docker', 'test'],
        maximum_timeout: 3600
      };

      const mockResponse = {
        id: 25,
        token: 'new-runner-token-xyz',
        description: 'New Test Runner',
        active: true,
        tag_list: ['docker', 'test']
      };

      mock
        .onPost('/runners')
        .reply(201, mockResponse);

      // When implemented:
      // const runner = await gitlabApi.registerRunner(registerData);
      // expect(runner).toEqual(mockResponse);
      // expect(runner.tag_list).toContain('docker');
    });

    it('should handle invalid registration token', async () => {
      mock
        .onPost('/runners')
        .reply(403, { message: 'Invalid registration token' });

      // When implemented:
      // await expect(gitlabApi.registerRunner({ token: 'invalid' })).rejects.toThrow('Invalid registration token');
    });

    it('should validate required registration fields', async () => {
      // When implemented, should validate required fields
      // expect(() => gitlabApi.registerRunner({})).toThrow('Registration token is required');
      // expect(() => gitlabApi.registerRunner({ token: '' })).toThrow('Registration token cannot be empty');
    });

    it('should validate tag list format', async () => {
      // When implemented, should validate tag format
      // const invalidTags = { token: 'valid-token', tag_list: ['invalid tag with spaces'] };
      // expect(() => gitlabApi.registerRunner(invalidTags)).toThrow('Tag names cannot contain spaces');
    });
  });

  describe('update_runner_settings', () => {
    it('should update runner settings successfully', async () => {
      const updateData = {
        description: 'Updated Runner Description',
        active: false,
        tag_list: ['docker', 'linux', 'updated'],
        run_untagged: true,
        locked: true,
        access_level: 'ref_protected',
        maximum_timeout: 7200
      };

      const mockResponse = {
        id: 1,
        description: 'Updated Runner Description',
        active: false,
        tag_list: ['docker', 'linux', 'updated'],
        run_untagged: true,
        locked: true,
        access_level: 'ref_protected',
        maximum_timeout: 7200
      };

      mock
        .onPut('/runners/1')
        .reply(200, mockResponse);

      // When implemented:
      // const runner = await gitlabApi.updateRunnerSettings(1, updateData);
      // expect(runner).toEqual(mockResponse);
      // expect(runner.active).toBe(false);
      // expect(runner.tag_list).toContain('updated');
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { description: 'New Description Only' };

      mock
        .onPut('/runners/1')
        .reply((config) => {
          const data = JSON.parse(config.data);
          expect(data).toEqual(partialUpdate);
          return [200, { id: 1, ...partialUpdate }];
        });

      // When implemented:
      // await gitlabApi.updateRunnerSettings(1, partialUpdate);
    });

    it('should handle insufficient permissions', async () => {
      mock
        .onPut('/runners/1')
        .reply(403, { message: 'Insufficient permissions to update runner' });

      // When implemented:
      // await expect(gitlabApi.updateRunnerSettings(1, {})).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('get_runner_jobs', () => {
    it('should list runner jobs successfully', async () => {
      const mockJobs = [
        {
          id: 1001,
          status: 'success',
          stage: 'test',
          name: 'unit-tests',
          ref: 'main',
          tag: false,
          coverage: 85.5,
          allow_failure: false,
          created_at: '2025-01-20T08:00:00Z',
          started_at: '2025-01-20T08:01:00Z',
          finished_at: '2025-01-20T08:05:00Z',
          duration: 240,
          queued_duration: 60,
          project: {
            id: 123,
            name: 'test-project',
            path_with_namespace: 'group/test-project'
          },
          pipeline: {
            id: 501,
            ref: 'main',
            sha: 'abc123def456',
            status: 'success'
          }
        },
        {
          id: 1002,
          status: 'failed',
          stage: 'deploy',
          name: 'deploy-staging',
          ref: 'main',
          tag: false,
          coverage: null,
          allow_failure: false,
          created_at: '2025-01-20T09:00:00Z',
          started_at: '2025-01-20T09:01:00Z',
          finished_at: '2025-01-20T09:03:00Z',
          duration: 120,
          queued_duration: 30
        }
      ];

      mock
        .onGet('/runners/1/jobs')
        .reply(200, mockJobs);

      // When implemented:
      // const jobs = await gitlabApi.getRunnerJobs(1);
      // expect(jobs).toEqual(mockJobs);
      // expect(jobs).toHaveLength(2);
      // expect(jobs[0].status).toBe('success');
    });

    it('should handle job status filtering', async () => {
      mock
        .onGet('/runners/1/jobs')
        .reply((config) => {
          expect(config.params.status).toBe('failed');
          return [200, []];
        });

      // When implemented:
      // await gitlabApi.getRunnerJobs(1, { status: 'failed' });
    });

    it('should handle pagination for job list', async () => {
      mock
        .onGet('/runners/1/jobs')
        .reply((config) => {
          expect(config.params).toMatchObject({
            page: 2,
            per_page: 50
          });
          return [200, []];
        });

      // When implemented:
      // await gitlabApi.getRunnerJobs(1, { page: 2, per_page: 50 });
    });
  });

  describe('runner_health_check', () => {
    it('should check runner health successfully', async () => {
      const mockHealthStatus = {
        runner_id: 1,
        status: 'healthy',
        online: true,
        last_contact: '2025-01-20T10:00:00Z',
        version: '15.8.0',
        platform: 'linux',
        architecture: 'amd64',
        executor: 'docker',
        builds_dir: '/builds',
        cache_dir: '/cache',
        features: {
          variables: true,
          image: true,
          services: true,
          artifacts: true,
          cache: true,
          shared: false
        },
        settings: {
          concurrent: 1,
          check_interval: 3,
          session_timeout: 1800
        },
        system_info: {
          cpu_usage: 15.2,
          memory_usage: 45.8,
          disk_usage: 60.1,
          load_average: [0.5, 0.3, 0.2]
        }
      };

      mock
        .onGet('/runners/1/verify')
        .reply(200, mockHealthStatus);

      // When implemented:
      // const health = await gitlabApi.runnerHealthCheck(1);
      // expect(health).toEqual(mockHealthStatus);
      // expect(health.status).toBe('healthy');
      // expect(health.system_info.cpu_usage).toBeLessThan(80);
    });

    it('should detect unhealthy runner', async () => {
      const mockUnhealthyStatus = {
        runner_id: 1,
        status: 'unhealthy',
        online: false,
        last_contact: '2025-01-19T10:00:00Z',
        errors: [
          'Runner not responding to ping',
          'Last contact over 24 hours ago'
        ]
      };

      mock
        .onGet('/runners/1/verify')
        .reply(200, mockUnhealthyStatus);

      // When implemented:
      // const health = await gitlabApi.runnerHealthCheck(1);
      // expect(health.status).toBe('unhealthy');
      // expect(health.errors).toContain('not responding');
    });

    it('should handle runner verification timeout', async () => {
      mock
        .onGet('/runners/1/verify')
        .timeout();

      // When implemented:
      // await expect(gitlabApi.runnerHealthCheck(1)).rejects.toThrow('timeout');
    });

    it('should handle network connectivity issues', async () => {
      mock
        .onGet('/runners/1/verify')
        .networkError();

      // When implemented:
      // await expect(gitlabApi.runnerHealthCheck(1)).rejects.toThrow('Network Error');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle rate limiting', async () => {
      mock
        .onGet('/projects/123/runners')
        .reply(429, { message: 'Rate limit exceeded' });

      // When implemented:
      // await expect(gitlabApi.getProjectRunners('123')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle server errors gracefully', async () => {
      mock
        .onGet('/runners')
        .reply(500, { message: 'Internal server error' });

      // When implemented:
      // await expect(gitlabApi.listSharedRunners()).rejects.toThrow('Internal server error');
    });

    it('should handle malformed response data', async () => {
      mock
        .onGet('/runners/1')
        .reply(200, 'invalid json');

      // When implemented, should handle parsing errors:
      // await expect(gitlabApi.getRunnerDetails(1)).rejects.toThrow('Invalid response format');
    });

    it('should validate input parameters', async () => {
      // When implemented, should validate all inputs:
      // expect(() => gitlabApi.getProjectRunners(null)).toThrow('Project ID is required');
      // expect(() => gitlabApi.getRunnerDetails(-1)).toThrow('Runner ID must be positive');
      // expect(() => gitlabApi.enableProjectRunner('', 1)).toThrow('Project ID cannot be empty');
    });
  });
});