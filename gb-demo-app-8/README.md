# Highload News Demo — этап 8

Учебное full-stack приложение на NestJS, React и Nx. Этот этап демонстрирует
кеширование списка новостей в отказоустойчивом Redis с автоматическим
переключением master через Sentinel.

## Архитектура

- `web` — React-интерфейс;
- `api` — NestJS API и раздача production-сборки frontend;
- `redis-master` и `redis-replica` — основное хранилище кеша и реплика;
- три Sentinel — обнаружение master и quorum для failover;
- Redis недоступен — API продолжает работать без кеша.

Созданные новости хранятся в памяти процесса. Redis кеширует результат
`GET /api/news` на 30 секунд; `POST /api/news` инвалидирует этот кеш. Это
намеренно учебная модель, а не замена постоянной базе данных.

## Быстрый запуск в Docker

Требуются Docker и Docker Compose.

```bash
docker compose up --build
```

После запуска приложение доступно на <http://localhost:3001>, API — на
<http://localhost:3001/api/news>.

Проверка Sentinel и кеша:

```bash
curl http://localhost:3001/api/news/cache/health
docker compose exec sentinel-1 redis-cli -p 26379 sentinel master mymaster
```

Проверка failover:

```bash
docker compose stop redis-master
docker compose exec sentinel-1 redis-cli -p 26379 get-master-addr-by-name mymaster
curl http://localhost:3001/api/news
```

Sentinel выбирает реплику новым master. Возврат старого контейнера:

```bash
docker compose start redis-master
```

Остановка с сохранением данных: `docker compose down`. Полное удаление
именованных томов: `docker compose down -v`.

## Локальная разработка

Проект зафиксирован на совместимой связке Node.js 16, Nx 13 и TypeScript 4.4.

```bash
npm ci --legacy-peer-deps
npm run start
```

Frontend запускается на <http://localhost:3002>, API — на порту `3001`.
Без переменных окружения API ищет обычный Redis на `127.0.0.1:6379`, но при
его отсутствии также продолжает работать.

Поддерживаемые переменные:

| Переменная | Значение по умолчанию |
|---|---|
| `PORT` | `3001` |
| `CACHE_TTL` | `30` |
| `REDIS_HOST` | `127.0.0.1` |
| `REDIS_PORT` | `6379` |
| `REDIS_SENTINELS` | пусто, формат `host:port,host:port` |
| `REDIS_MASTER_NAME` | `mymaster` |

## Команды

```bash
npm run test       # unit-тесты API и frontend
npm run test:api
npm run test:web
npm run build      # production-сборка обоих приложений
```

## API

- `GET /api/news` — список новостей;
- `POST /api/news` — создание новости (`title`, `description`);
- `GET /api/news/cache/health` — проверка соединения с Redis master.

Конфигурации `redis-cluster-6001.conf` … `redis-cluster-6006.conf` сохранены
как материал отдельного эксперимента с Redis Cluster. Production-сценарий
этого этапа использует Sentinel; одновременно эти режимы не запускаются.
