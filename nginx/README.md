# Фронтенд за nginx


## Как запустить фронт и бэкенд (одна страница, один порт)

### Вариант 1: Docker Compose (рекомендуется)

Из корня **Parking_lot**:

```bash
docker compose up --build
```

- **Страница приложения:** http://localhost  
- Фронт отдаётся nginx на порту 80, запросы `/api/` проксируются на бэкенд в той же сети.  
- БД SQLite лежит в файле `parking.db` в корне проекта (монтируется в контейнер бэкенда).

Остановка: `Ctrl+C` или `docker compose down`.

### Вариант 2: Без Docker (бэкенд и nginx на хосте)

1. **Бэкенд** (первый терминал):
   ```bash
   cd Parking_lot
   npm run dev:backend
   ```
   Слушает порт 3001.

2. **Фронт через nginx** (второй терминал):
   ```bash
   cd Parking_lot
   npm run serve:nginx
   ```
   Страница: http://localhost:8080 (nginx раздаёт `build/` и проксирует `/api` на 3001).

Либо вместо nginx просто **сборка + dev-сервер** (только для разработки, не для сдачи):
   ```bash
   npm run build
   npm run start
   ```
   Тогда фронт на порту 3000, API нужно вызывать с порта 3001 (два порта).

---

## Сборка и запуск образа (для сдачи)

```bash
# Из корня Parking_lot
docker build -f Dockerfile.frontend -t parking-frontend .
docker run -p 80:80 --add-host=backend:host-gateway parking-frontend
```

Бэкенд должен быть запущен отдельно (на хосте на порту 3001 или в контейнере в одной сети с именем `backend`). Приложение доступно на http://localhost:80.

## Локально (без Docker)

1. Собрать фронтенд: из корня проекта `npm run build`.
2. Запустить бэкенд на порту 3001: `npm run dev:backend` или `npm run start:backend`.
3. Запустить nginx с конфигом из этой папки:
   - **Windows (из корня Parking_lot):**  
     `nginx -p . -c nginx/nginx-local.conf`  
     Фронт будет на http://localhost:8080, API проксируется на http://127.0.0.1:3001.
   - **Linux/macOS:**  
     скопировать `nginx-local.conf` в свой `sites-enabled` и указать в `root` полный путь к папке `build` проекта.

## Docker-образ

Сборка образа с фронтендом и nginx:

```bash
npm run build:nginx
```

Или вручную:

```bash
docker build -f Dockerfile.frontend -t parking-frontend .
```

Запуск контейнера (бэкенд должен быть доступен по имени `backend` в одной сети, например через docker-compose):

```bash
docker run -p 80:80 --add-host=backend:host-gateway parking-frontend
```

Либо в `docker-compose.yml` задать сервис `backend` и подключить к нему этот контейнер в одной сети — тогда в конфиге уже указан `proxy_pass http://backend:3001/api/`.
