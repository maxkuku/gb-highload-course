import { Body, Controller, Get, Header, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { CacheService } from './cache.service';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export interface NewsItem extends CreateNewsDto {
  id: number;
  createdAt: number;
}

@Controller('news')
export class NewsController {
  private readonly cacheKey = 'news:list:v1';
  private readonly createdNews: NewsItem[] = [];

  constructor(private readonly cache: CacheService) {}

  @Get()
  async getNews(): Promise<NewsItem[]> {
    const cached = await this.cache.get<NewsItem[]>(this.cacheKey);
    if (cached) {
      return cached;
    }

    const generated = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      title: `Важная новость ${index + 1}`,
      description: `Описание новости ${index + 1}`,
      createdAt: Date.now() - index * 1000,
    }));
    const news = [...this.createdNews, ...generated];
    await this.cache.set(this.cacheKey, news, Number(process.env.CACHE_TTL || 30));
    return news;
  }

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Body() item: CreateNewsDto): Promise<NewsItem> {
    const news = {
      id: Date.now(),
      ...item,
      createdAt: Date.now(),
    };
    this.createdNews.unshift(news);
    await this.cache.delete(this.cacheKey);
    return news;
  }

  @Get('cache/health')
  async cacheHealth() {
    return { status: await this.cache.ping() };
  }
}
