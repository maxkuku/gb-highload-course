import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { CacheService } from './cache.service';

@Module({
  controllers: [NewsController],
  providers: [CacheService],
})
export class NewsModule {}
