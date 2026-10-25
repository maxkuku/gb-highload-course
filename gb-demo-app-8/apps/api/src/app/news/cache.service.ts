import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis;

  constructor() {
    const options: RedisOptions = {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: times => Math.min(times * 200, 2000),
    };
    const sentinels = (process.env.REDIS_SENTINELS || '')
      .split(',')
      .filter(Boolean)
      .map(address => {
        const [host, port = '26379'] = address.trim().split(':');
        return { host, port: Number(port) };
      });

    this.client = sentinels.length
      ? new Redis({
          ...options,
          sentinels,
          name: process.env.REDIS_MASTER_NAME || 'mymaster',
        })
      : new Redis({
          ...options,
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT || 6379),
        });

    this.client.on('error', error => {
      this.logger.warn(`Redis unavailable; continuing without cache: ${error.message}`);
    });
  }

  private async ensureConnected(): Promise<void> {
    if (this.client.status === 'wait' || this.client.status === 'end') {
      await this.client.connect();
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      await this.ensureConnected();
      const value = await this.client.get(key);
      return value ? JSON.parse(value) as T : undefined;
    } catch {
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.ensureConnected();
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Cache failure must not make the API unavailable.
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.ensureConnected();
      await this.client.del(key);
    } catch {
      // Cache failure must not make the API unavailable.
    }
  }

  async ping(): Promise<string> {
    await this.ensureConnected();
    return this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== 'end') {
      this.client.disconnect();
    }
  }
}
