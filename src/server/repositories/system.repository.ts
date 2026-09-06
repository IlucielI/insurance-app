import { ISystemRepository, SystemMetadata } from './system.repository.interface';
import packageJson from '../../../package.json';

const startedAt = new Date();

export class SystemRepository implements ISystemRepository {
  private static cachedGitHash: string | null = null;

  getStartTime(): Date {
    return startedAt;
  }

  getSystemMetadata(): SystemMetadata {
    return {
      version: process.env.APP_VERSION || packageJson.version || '0.1.0',
      gitHash: this.resolveGitHash(),
      startedAt: this.getStartTime(),
    };
  }

  private resolveGitHash(): string {
    if (process.env.GIT_HASH) {
      return process.env.GIT_HASH;
    }

    if (SystemRepository.cachedGitHash) {
      return SystemRepository.cachedGitHash;
    }

    if (typeof window === 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { execSync } = require('child_process');
        const hash = (
          execSync('git rev-parse --short HEAD', {
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'ignore'],
          }) || ''
        ).trim();
        const resolved = hash || 'unknown';
        SystemRepository.cachedGitHash = resolved;
        return resolved;
      } catch {
        SystemRepository.cachedGitHash = 'dev';
        return 'dev';
      }
    }

    SystemRepository.cachedGitHash = 'dev';
    return 'dev';
  }
}
