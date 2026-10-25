import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { CacheService } from './cache.service';

describe('NewsController', () => {
  let controller: NewsController;
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    ping: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [{ provide: CacheService, useValue: cache }],
    }).compile();

    controller = module.get<NewsController>(NewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns cached news without regenerating it', async () => {
    const news = [{ id: 1, title: 'Cached', description: 'Value', createdAt: 1 }];
    cache.get.mockResolvedValueOnce(news);

    await expect(controller.getNews()).resolves.toEqual(news);
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('caches generated news on a cache miss', async () => {
    cache.get.mockResolvedValueOnce(undefined);

    const news = await controller.getNews();

    expect(news).toHaveLength(20);
    expect(cache.set).toHaveBeenCalledWith('news:list:v1', news, 30);
  });

  it('invalidates the list cache after creating news', async () => {
    const created = await controller.create({ title: 'Title', description: 'Text' });

    expect(created).toMatchObject({ title: 'Title', description: 'Text' });
    expect(cache.delete).toHaveBeenCalledWith('news:list:v1');
  });
});
