# Parking Lot — Менеджеры состояния

Два фронтенд-приложения на одном бэкенде, демонстрирующие два подхода к управлению состоянием.

## Структура проекта

```
Parking_lot/
├── backend/          # Node.js + Express + PostgreSQL
├── redux-app/        # React + Redux Toolkit + RTK Query
├── mobx-app/         # React + MobX + mobx-react-lite
└── docker-compose.yml
```

---

## Установка и запуск

### 1. Запуск бэкенда

```bash
docker-compose up -d postgres backend
```

### 2. Redux-приложение

```bash
cd redux-app
npm install
npm start
# → http://localhost:3000
```

### 3. MobX-приложение

```bash
cd mobx-app
npm install
npm start
# → http://localhost:3001 (или другой порт)
```

---

## Приложение 1: Redux RTK (`redux-app/`)

### Зависимости
- `@reduxjs/toolkit` — Redux + RTK Query
- `react-redux` — интеграция с React

### Структура

```
redux-app/src/
├── api/
│   └── baseApi.ts          ← createApi() с кэшированием
├── store/
│   ├── index.ts            ← configureStore
│   └── authSlice.ts        ← токены и user
├── services/
│   ├── authApi.ts          ← login, getProfile, updateProfile
│   ├── carsApi.ts          ← getCars, addCar, deleteCar
│   ├── parkingApi.ts       ← getPlaces, getSessions, bookParking
│   └── profileApi.ts       ← getFullProfile
└── components/
    ├── Header.tsx           ← user.name из authSlice
    ├── Login.tsx            ← useLoginMutation
    ├── Profile.tsx          ← 4 запроса, UserInfo внутри
    └── UserInfo.tsx         ← использует 3 кэша RTK Query
```

### Как работает кэш RTK Query

```
Компонент A: useGetProfileQuery()  ─┐
                                     ├─→ ОДИН HTTP запрос GET /api/auth/profile
Компонент B: useGetProfileQuery()  ─┤   Результат → store['api']['queries']['getProfile']
                                     │
Компонент C: useGetProfileQuery()  ─┘   Все читают из кэша (0 HTTP!)

После PUT /api/auth/profile:
  invalidatesTags: ['User']  ─→  кэш сброшен  ─→  один новый запрос
```

**Параметры кэша в `baseApi.ts`:**
| Параметр | Значение | Описание |
|----------|----------|----------|
| `keepUnusedDataFor` | 300 сек | Хранить данные 5 мин после размонтирования |
| `refetchOnMountOrArgChange` | 60 сек | Перезапрашивать если данным > 1 мин |
| `refetchOnFocus` | true | Обновлять при возврате на вкладку |
| `refetchOnReconnect` | true | Обновлять при восстановлении сети |

---

## Приложение 2: MobX (`mobx-app/`)

### Зависимости
- `mobx` — реактивный стейт
- `mobx-react-lite` — интеграция с React (`observer`)

### Структура

```
mobx-app/src/
├── api/
│   └── axiosInstance.ts    ← axios + JWT интерцептор
├── stores/
│   ├── RootStore.ts        ← объединяет все сторы
│   ├── AuthStore.ts        ← user, token, TTL-кэш 5 мин
│   ├── CarsStore.ts        ← cars[], TTL-кэш 3 мин
│   └── ParkingStore.ts     ← places[], sessions[], TTL-кэш 1-2 мин
├── context/
│   └── StoreContext.tsx    ← React Context + useStore() хук
└── components/
    ├── Header.tsx           ← observer: authStore.user.name
    ├── Login.tsx            ← observer: authStore.loading/error
    ├── Profile.tsx          ← observer: все три стора
    └── UserInfo.tsx         ← observer: user + carsCount + activeSessions
```

### Как работает TTL-кэш MobX

```typescript
// В каждом сторе:
private _lastFetched: number | null = null;
private _cacheTTL = 5 * 60 * 1000; // 5 минут

get isCacheValid() {
  return this._lastFetched !== null
    && (Date.now() - this._lastFetched) < this._cacheTTL;
}

async fetchProfile(force = false) {
  if (!force && this.isCacheValid && this.user) return; // ← кэш HIT
  // ... HTTP запрос
  this._lastFetched = Date.now(); // ← обновляем метку
}
```

### Как работает реактивность MobX

```
authStore.login() → runInAction → this.user = { id: 1, name: 'Иван', ... }
                                          ↓
                           MobX Proxy фиксирует изменение
                                          ↓
          ┌───────────────┬──────────────┬───────────────┐
          ↓               ↓              ↓               ↓
      Header.tsx     Profile.tsx    UserInfo.tsx    Sidebar.tsx
   (читает user.name) (читает user)  (читает user)  (читает user.email)
   
   ВСЕ перерисуются — автоматически, точечно, без лишних рендеров
```

---

## Данные в нескольких частях приложения

### `User` — используется в 4 компонентах

| Компонент | Что отображает | Redux | MobX |
|-----------|---------------|-------|------|
| `Header` | Имя в навигации | `useAppSelector(selectCurrentUser)` | `authStore.user.name` |
| `Profile` | Имя + email + ID | `useGetProfileQuery()` | `authStore.user` |
| `UserInfo` | Карточка пользователя | `useGetProfileQuery()` | `authStore.user` |
| `Login` | Редирект после входа | `selectIsAuthenticated` | `authStore.isAuthenticated` |

### Количество HTTP-запросов

| Ситуация | Redux RTK | MobX |
|----------|-----------|------|
| 4 компонента читают User | **1 запрос** (кэш) | **1 запрос** (если свежий TTL) |
| После logout → login | 1 (инвалидация тэгов) | 1 (invalidateCache) |
| Возврат на вкладку | 1 (refetchOnFocus) | 0 (TTL не истёк) |

---

## Сравнение подходов

| | Redux RTK | MobX |
|-|-----------|------|
| **Кэш** | Автомат через `providesTags` | Ручной TTL |
| **Инвалидация** | `invalidatesTags` | `invalidateCache()` |
| **Реактивность** | `useSelector` hook | `observer()` wrapper |
| **Boilerplate** | Больше (slice + api) | Меньше (класс + makeAutoObservable) |
| **Отладка** | Redux DevTools | MobX DevTools |
| **TypeScript** | Отличная поддержка | Отличная поддержка |
| **Подход** | Функциональный, иммутабельный | ООП, мутабельный |
