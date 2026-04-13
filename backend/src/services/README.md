# Микросервисы backend

Каждый сервис в своей директории с собственными `package.json` и `package-lock.json`.

| Директория          | Файл                    | Назначение                    |
|---------------------|-------------------------|-------------------------------|
| `auth/`             | authService.ts          | Регистрация, вход, профиль, смена пароля |
| `cars/`             | carService.ts           | CRUD автомобилей пользователя |
| `parking/`          | parkingService.ts       | Места, бронирования, завершение сессий   |
| `profile/`          | profileService.ts       | Данные профиля (user + car)   |
| `selection-context/` | selectionContextService.ts | Контекст для страницы выбора парковки |

Сборка backend по-прежнему одна: `npm run build` в корне `backend/` компилирует все сервисы в `dist/`. Зависимости для запуска приложения заданы в `backend/package.json`; в `package.json` сервисов перечислены только зависимости, специфичные для данного сервиса (например, `auth` — bcryptjs).
