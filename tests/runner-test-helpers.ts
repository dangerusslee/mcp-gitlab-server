/**
 * Test helpers and utilities for GitLab Runner management tests
 * 
 * This file provides common test utilities, mock data, and helper functions
 * for testing runner management functionality.
 */

import { GitLabPipelineManager } from '../src/gitlab-pipeline-manager.js';

// Mock data generators for consistent testing
export const MockRunnerData = {
  /**
   * Generate a mock project runner
   */
  projectRunner: (overrides: Partial<any> = {}) => ({
    id: 1,
    description: 'Test Project Runner',
    ip_address: '192.168.1.100',
    active: true,
    is_shared: false,
    runner_type: 'project_type',
    name: 'test-project-runner',
    online: true,
    status: 'online',
    tag_list: ['docker', 'linux'],
    version: '15.8.0',
    access_level: 'not_protected',
    maximum_timeout: 3600,
    architecture: 'amd64',
    platform: 'linux',
    contacted_at: '2025-01-20T10:00:00Z',
    token_expires_at: null,
    ...overrides
  }),

  /**
   * Generate a mock shared runner
   */
  sharedRunner: (overrides: Partial<any> = {}) => ({
    id: 10,
    description: 'Test Shared Runner',
    ip_address: '10.0.0.100',
    active: true,
    is_shared: true,
    runner_type: 'instance_type',
    name: 'gitlab-runner-shared',
    online: true,
    status: 'online',
    tag_list: ['docker', 'kubernetes'],
    version: '15.8.0',
    access_level: 'not_protected',
    maximum_timeout: 3600,
    architecture: 'amd64',
    platform: 'linux',
    contacted_at: '2025-01-20T10:30:00Z',
    ...overrides
  }),

  /**
   * Generate mock runner details
   */
  runnerDetails: (overrides: Partial<any> = {}) => ({
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
    job_failure_count: 2,
    ...overrides
  }),

  /**
   * Generate mock runner job
   */
  runnerJob: (overrides: Partial<any> = {}) => ({
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
    },
    ...overrides
  }),

  /**
   * Generate mock health check response
   */
  healthCheck: (overrides: Partial<any> = {}) => ({
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
    },
    ...overrides
  })
};

// Common test scenarios for error handling
export const RunnerErrorScenarios = {
  authentication: {
    code: 401,
    message: 'Unauthorized',
    description: 'Invalid or missing authentication token'
  },
  
  notFound: {
    code: 404,
    message: 'Runner not found',
    description: 'Runner with specified ID does not exist'
  },
  
  forbidden: {
    code: 403,
    message: 'Insufficient permissions',
    description: 'User lacks required permissions'
  },
  
  conflict: {
    code: 409,
    message: 'Runner already enabled for project',
    description: 'Attempting to enable already enabled runner'
  },
  
  unprocessable: {
    code: 422,
    message: 'Invalid runner configuration',
    description: 'Runner data fails validation'
  },
  
  rateLimit: {
    code: 429,
    message: 'Rate limit exceeded',
    description: 'Too many requests in time period'
  },
  
  serverError: {
    code: 500,
    message: 'Internal server error',
    description: 'Server-side error occurred'
  }
};

// Validation helpers
export const RunnerValidation = {
  /**
   * Validate runner tag format
   */
  isValidTag: (tag: string): boolean => {
    // Tags cannot contain spaces or special characters except dash and underscore
    return /^[a-zA-Z0-9._-]+$/.test(tag);
  },

  /**
   * Validate runner ID format
   */
  isValidRunnerId: (id: any): boolean => {
    return typeof id === 'number' && id > 0;
  },

  /**
   * Validate project ID format
   */
  isValidProjectId: (id: any): boolean => {
    return typeof id === 'string' && id.length > 0;
  },

  /**
   * Validate runner status
   */
  isValidStatus: (status: string): boolean => {
    const validStatuses = ['online', 'offline', 'never_contacted'];
    return validStatuses.includes(status);
  }
};

// Test utilities for async operations
export const TestUtils = {
  /**
   * Wait for a specified time (for testing timeouts)
   */
  wait: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Create a promise that rejects after timeout
   */
  timeoutPromise: <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });
    return Promise.race([promise, timeout]);
  },

  /**
   * Generate random test data
   */
  randomString: (length: number = 8): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  },

  /**
   * Generate random runner ID
   */
  randomRunnerId: (): number => {
    return Math.floor(Math.random() * 1000) + 1;
  }
};

// Mock axios adapter setup helpers
export const MockSetup = {
  /**
   * Setup standard runner list mock
   */
  setupRunnerListMock: (mock: any, projectId: string, runners: any[]) => {
    mock.onGet(`/projects/${projectId}/runners`).reply(200, runners);
  },

  /**
   * Setup standard shared runners mock
   */
  setupSharedRunnersMock: (mock: any, runners: any[]) => {
    mock.onGet('/runners').reply(200, runners);
  },

  /**
   * Setup runner details mock
   */
  setupRunnerDetailsMock: (mock: any, runnerId: number, details: any) => {
    mock.onGet(`/runners/${runnerId}`).reply(200, details);
  },

  /**
   * Setup runner jobs mock
   */
  setupRunnerJobsMock: (mock: any, runnerId: number, jobs: any[]) => {
    mock.onGet(`/runners/${runnerId}/jobs`).reply(200, jobs);
  },

  /**
   * Setup health check mock
   */
  setupHealthCheckMock: (mock: any, runnerId: number, health: any) => {
    mock.onGet(`/runners/${runnerId}/verify`).reply(200, health);
  },

  /**
   * Setup error response mock
   */
  setupErrorMock: (mock: any, method: string, url: string, error: any) => {
    mock[`on${method.charAt(0).toUpperCase() + method.slice(1)}`](url)
        .reply(error.code, { message: error.message });
  }
};

// Expected API endpoints for runner operations
export const RunnerEndpoints = {
  projectRunners: (projectId: string) => `/projects/${projectId}/runners`,
  sharedRunners: () => '/runners',
  runnerDetails: (runnerId: number) => `/runners/${runnerId}`,
  runnerJobs: (runnerId: number) => `/runners/${runnerId}/jobs`,
  runnerHealthCheck: (runnerId: number) => `/runners/${runnerId}/verify`,
  enableRunner: (projectId: string) => `/projects/${projectId}/runners`,
  disableRunner: (projectId: string, runnerId: number) => `/projects/${projectId}/runners/${runnerId}`,
  registerRunner: () => '/runners',
  updateRunner: (runnerId: number) => `/runners/${runnerId}`
};

// Coverage tracking for test completeness
export const TestCoverage = {
  requiredFunctions: [
    'get_project_runners',
    'list_shared_runners',
    'get_runner_details',
    'enable_project_runner',
    'disable_project_runner',
    'register_runner',
    'update_runner_settings',
    'get_runner_jobs',
    'runner_health_check'
  ],

  requiredScenarios: [
    'success_cases',
    'authentication_errors',
    'validation_errors',
    'not_found_errors',
    'permission_errors',
    'rate_limiting',
    'server_errors',
    'network_timeouts',
    'malformed_responses'
  ],

  requiredEdgeCases: [
    'empty_responses',
    'large_datasets',
    'concurrent_operations',
    'offline_runners',
    'invalid_tags',
    'expired_tokens',
    'resource_cleanup'
  ]
};

// Performance benchmarks for runner operations
export const PerformanceBenchmarks = {
  maxResponseTime: {
    list_runners: 2000,      // 2 seconds
    get_details: 1000,       // 1 second
    health_check: 5000,      // 5 seconds
    register_runner: 3000,   // 3 seconds
    update_settings: 1500    // 1.5 seconds
  },

  maxRetryAttempts: 3,
  retryDelay: 1000,          // 1 second
  timeoutThreshold: 30000    // 30 seconds
};

export default {
  MockRunnerData,
  RunnerErrorScenarios,
  RunnerValidation,
  TestUtils,
  MockSetup,
  RunnerEndpoints,
  TestCoverage,
  PerformanceBenchmarks
};