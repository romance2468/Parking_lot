# Архитектура менеджеров состояния: Redux RTK и MobX

## Обзор проекта

Приложение «Парковка» использует **два независимых фронтенд-приложения**, каждое из которых работает с одним и тем же бэкендом (Node.js + PostgreSQL), но управляет состоянием по-разному:

| Приложение | Менеджер состояния | Папка |
|------------|-------------------|-------|
| Redux-версия | Redux Toolkit + RTK Query | `redux-app/` |
| MobX-версия | MobX + mobx-react-lite | `mobx-app/` |

---

## Текущая архитектура бэкенда

### API-эндпоинты (из swagger.ts)

```
POST /api/auth/register       — регистрация
POST /api/auth/login          — вход (возвращает JWT + refreshToken)
POST /api/auth/refresh        — обновление токена
GET  /api/auth/profile        — профиль текущего пользователя
PUT  /api/auth/profile        — обновление профиля
GET  /api/cars                — список автомобилей пользователя
POST /api/cars                — добавить авто
DELETE /api/cars/:id          — удалить авто
GET  /api/parking             — список парковочных мест
POST /api/parking/book        — забронировать место
GET  /api/parking/sessions    — история бронирований
GET  /api/profile             — объединённый профиль (user + cars + sessions)
```

### Модели данных

```typescript
// Пользователь
interface User {
  id: number;
  name: string;
  email: string;
}

// Автомобиль
interface Car {
  id: number;
  user_id: number;
  type: 'sedan' | 'suv' | 'hatchback' | 'electric';
  mark: string;
  auto_number: string;
  color: string;
  notes: string;
  created_at: string;
}

// Парковочное место
interface ParkingPlace {
  id_parking: number;
  floor: number;
  section: string;
  place_num: number;
  is_free: boolean;
  type_parking: 'standard' | 'electric' | 'handicap';
}

// Сессия бронирования
interface BookingSession {
  id_session: number;
  car_id: number;
  id_parking: number;
  time_start: string;
  time_end?: string;
  price: number;
}
```

---

## Приложение 1: Redux RTK (`redux-app/`)

### Структура папок

```
redux-app/
├── public/
├── src/
│   ├── api/
│   │   └── baseApi.ts            # RTK Query — базовый экземпляр createApi
│   ├── store/
│   │   ├── index.ts              # configureStore — корневой store
│   │   ├── authSlice.ts          # slice: текущий пользователь, токены
│   │   └── uiSlice.ts            # slice: глобальное UI-состояние
│   ├── services/
│   │   ├── authApi.ts            # RTK Query endpoints: login, register, profile
│   │   ├── carsApi.ts            # RTK Query endpoints: getCars, addCar, deleteCar
│   │   ├── parkingApi.ts         # RTK Query endpoints: getPlaces, book, getSessions
│   │   └── profileApi.ts         # RTK Query endpoint: getFullProfile
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── Profile.tsx           # использует данные user + cars + sessions
│   │   ├── UserInfo.tsx          # дополнительный компонент — тоже читает user
│   │   ├── Cars.tsx
│   │   ├── Parking.tsx
│   │   └── Header.tsx            # отображает имя пользователя из store
│   ├── hooks/
│   │   └── useAuth.ts            # хук для доступа к auth state
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

### Как работает Redux RTK

#### 1. Инициализация Store (`store/index.ts`)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import authReducer from './authSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer, // RTK Query кэш
    auth: authReducer,                       // пользователь, токены
    ui: uiReducer,                           // loading, errors
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware), // RTK Query middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 2. Базовый API (`api/baseApi.ts`)

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Автоматически добавляем JWT токен к каждому запросу
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // Тэги для инвалидации кэша
  tagTypes: ['User', 'Cars', 'Parking', 'Sessions', 'Profile'],
  endpoints: () => ({}),
});
```

#### 3. Auth API (`services/authApi.ts`) — с кэшированием

```typescript
import { baseApi } from '../api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/auth/login
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Инвалидируем кэш профиля после входа
      invalidatesTags: ['User', 'Profile'],
    }),

    // GET /api/auth/profile — КЭШИРУЕТСЯ!
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
      // keepUnusedDataFor: 300 — данные хранятся 5 минут после размонтирования
      keepUnusedDataFor: 300,
    }),

    // PUT /api/auth/profile
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      // После обновления сбрасываем кэш пользователя и профиля
      invalidatesTags: ['User', 'Profile'],
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery, useUpdateProfileMutation } = authApi;
```

#### 4. Auth Slice (`store/authSlice.ts`)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
});
```

#### 5. Кэширование в RTK Query

RTK Query автоматически кэширует результаты запросов. Вот как это работает:

```
Компонент A запрашивает useGetProfileQuery()
    ↓
RTK Query проверяет кэш по тэгу 'User'
    ↓
Если кэш свежий → возвращает из кэша (нет запроса к серверу!)
Если кэш устарел / пустой → делает запрос к /api/auth/profile
    ↓
Результат сохраняется в Redux Store (раздел 'api')
    ↓
Компонент B тоже вызывает useGetProfileQuery()
    → Получает те же данные из кэша (0 запросов к серверу!)
```

**Параметры кэширования:**
- `keepUnusedDataFor: 300` — хранить данные 300 секунд после размонтирования
- `refetchOnMountOrArgChange: true` — перезапрашивать при монтировании
- `refetchOnFocus: true` — перезапрашивать когда пользователь возвращается на вкладку
- `invalidatesTags: ['User']` — сбрасывает кэш при мутациях

#### 6. Использование данных в нескольких компонентах

Ключевой принцип: **один и тот же хук `useGetProfileQuery()` используется в разных компонентах**, но реальный HTTP-запрос делается ТОЛЬКО ОДИН РАЗ:

```typescript
// Header.tsx — отображает имя пользователя
const Header = () => {
  const { data: user } = useGetProfileQuery();
  return <nav>Привет, {user?.name}</nav>;
};

// Profile.tsx — полная страница профиля
const Profile = () => {
  const { data: user, isLoading } = useGetProfileQuery();
  const { data: cars } = useGetCarsQuery();
  return (
    <div>
      <UserInfo user={user} />   {/* подкомпонент */}
      <CarsList cars={cars} />
    </div>
  );
};

// UserInfo.tsx — дополнительная информация (используется и в Profile, и в Sidebar)
const UserInfo = () => {
  const { data: user } = useGetProfileQuery(); // тот же кэш!
  const { data: sessions } = useGetSessionsQuery();
  return (
    <Card>
      <h2>{user?.name}</h2>
      <p>Email: {user?.email}</p>
      <p>Сессий: {sessions?.length}</p>
    </Card>
  );
};
```

---

## Приложение 2: MobX (`mobx-app/`)

### Структура папок

```
mobx-app/
├── public/
├── src/
│   ├── api/
│   │   └── axiosInstance.ts      # axios с интерцептором токена
│   ├── stores/
│   │   ├── RootStore.ts          # корневой стор — соединяет все сторы
│   │   ├── AuthStore.ts          # observable: user, token, isAuthenticated
│   │   ├── CarsStore.ts          # observable: cars[], loading, error
│   │   ├── ParkingStore.ts       # observable: places[], sessions[]
│   │   └── ProfileStore.ts       # observable: fullProfile, кэш данных
│   ├── context/
│   │   └── StoreContext.tsx      # React контекст для передачи RootStore
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── Profile.tsx           # observer: user + cars + sessions
│   │   ├── UserInfo.tsx          # observer: использует AuthStore + ParkingStore
│   │   ├── Cars.tsx
│   │   ├── Parking.tsx
│   │   └── Header.tsx            # observer: отображает user из AuthStore
│   ├── hooks/
│   │   └── useStore.ts           # хук для доступа к RootStore
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

### Как работает MobX

#### 1. RootStore (`stores/RootStore.ts`)

```typescript
import { AuthStore } from './AuthStore';
import { CarsStore } from './CarsStore';
import { ParkingStore } from './ParkingStore';
import { ProfileStore } from './ProfileStore';

export class RootStore {
  authStore: AuthStore;
  carsStore: CarsStore;
  parkingStore: ParkingStore;
  profileStore: ProfileStore;

  constructor() {
    // Создаём все сторы и передаём им ссылку на rootStore
    // для cross-store коммуникации
    this.authStore = new AuthStore(this);
    this.carsStore = new CarsStore(this);
    this.parkingStore = new ParkingStore(this);
    this.profileStore = new ProfileStore(this);
  }
}
```

#### 2. AuthStore (`stores/AuthStore.ts`)

```typescript
import { makeAutoObservable, runInAction } from 'mobx';
import { axiosInstance } from '../api/axiosInstance';

export class AuthStore {
  // observable поля — при изменении React-компоненты перерисуются
  user: User | null = null;
  token: string | null = localStorage.getItem('token');
  refreshToken: string | null = localStorage.getItem('refreshToken');
  isAuthenticated: boolean = !!localStorage.getItem('token');
  loading: boolean = false;
  error: string | null = null;

  // Кэш данных пользователя (TTL-кэш)
  private _lastFetched: number | null = null;
  private _cacheTTL = 5 * 60 * 1000; // 5 минут

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this); // автоматически делает все поля observable
  }

  // computed — вычисляемое значение
  get isProfileCacheValid(): boolean {
    return this._lastFetched !== null 
      && Date.now() - this._lastFetched < this._cacheTTL;
  }

  // action — метод изменения состояния
  async login(credentials: LoginCredentials) {
    this.loading = true;
    this.error = null;
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      runInAction(() => {
        this.token = response.data.token;
        this.refreshToken = response.data.refreshToken;
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', this.token!);
        localStorage.setItem('refreshToken', this.refreshToken!);
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error || 'Ошибка входа';
      });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  // Загрузка профиля с кэшированием
  async fetchProfile(force = false) {
    // Если кэш актуален и нет принудительного обновления — не запрашиваем
    if (!force && this.isProfileCacheValid && this.user) return;

    this.loading = true;
    try {
      const response = await axiosInstance.get('/auth/profile');
      runInAction(() => {
        this.user = response.data;
        this._lastFetched = Date.now(); // обновляем метку кэша
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => { this.loading = false; });
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    this._lastFetched = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}
```

#### 3. CarsStore с кэшированием (`stores/CarsStore.ts`)

```typescript
import { makeAutoObservable, runInAction } from 'mobx';

export class CarsStore {
  cars: Car[] = [];
  loading = false;
  error: string | null = null;
  private _lastFetched: number | null = null;
  private _cacheTTL = 3 * 60 * 1000; // 3 минуты

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  get isCacheValid() {
    return this._lastFetched !== null
      && Date.now() - this._lastFetched < this._cacheTTL;
  }

  // computed: количество авто у пользователя
  get carsCount() {
    return this.cars.length;
  }

  // computed: есть ли электромобили
  get hasElectricCar() {
    return this.cars.some(car => car.type === 'electric');
  }

  async fetchCars(force = false) {
    if (!force && this.isCacheValid && this.cars.length > 0) return;

    this.loading = true;
    try {
      const response = await axiosInstance.get('/cars');
      runInAction(() => {
        this.cars = response.data;
        this._lastFetched = Date.now();
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error;
        this.loading = false;
      });
    }
  }

  async addCar(car: Omit<Car, 'id' | 'user_id' | 'created_at'>) {
    const response = await axiosInstance.post('/cars', car);
    runInAction(() => {
      this.cars.push(response.data);
      this._lastFetched = Date.now(); // обновляем кэш
    });
  }

  async deleteCar(id: number) {
    await axiosInstance.delete(`/cars/${id}`);
    runInAction(() => {
      this.cars = this.cars.filter(c => c.id !== id);
    });
  }
}
```

#### 4. StoreContext (`context/StoreContext.tsx`)

```typescript
import React, { createContext, useContext } from 'react';
import { RootStore } from '../stores/RootStore';

const StoreContext = createContext<RootStore | null>(null);

// Создаём единственный экземпляр RootStore для всего приложения
const rootStore = new RootStore();

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StoreContext.Provider value={rootStore}>
    {children}
  </StoreContext.Provider>
);

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  return store;
};
```

#### 5. Использование в компонентах (observer)

```typescript
import { observer } from 'mobx-react-lite';
import { useStore } from '../hooks/useStore';

// Header.tsx — подписывается только на user из authStore
const Header = observer(() => {
  const { authStore } = useStore();
  return <nav>Привет, {authStore.user?.name}</nav>;
});

// Profile.tsx — использует данные из трёх сторов
const Profile = observer(() => {
  const { authStore, carsStore, parkingStore } = useStore();

  useEffect(() => {
    authStore.fetchProfile();     // загрузка с кэшем
    carsStore.fetchCars();        // загрузка с кэшем
    parkingStore.fetchSessions(); // загрузка с кэшем
  }, []);

  return (
    <div>
      <UserInfo />      {/* отдельный observer-компонент */}
      <CarsList />
      <SessionsList />
    </div>
  );
});

// UserInfo.tsx — тот же authStore + parkingStore
// Используется и в Profile, и в Sidebar
const UserInfo = observer(() => {
  const { authStore, parkingStore } = useStore();
  return (
    <Card>
      <h2>{authStore.user?.name}</h2>
      <p>Email: {authStore.user?.email}</p>
      <p>Активных сессий: {parkingStore.activeSessions.length}</p>
      <p>Авто: {carsStore.carsCount}</p>
    </Card>
  );
});
```

---

## Сравнительная таблица подходов

| Характеристика | Redux RTK | MobX |
|----------------|-----------|------|
| **Кэширование** | Автоматически через RTK Query (`providesTags`) | Вручную через TTL (`_lastFetched`) |
| **Реактивность** | Selector hooks (`useSelector`) | `observer()` + `makeAutoObservable` |
| **Мутации** | `builder.mutation` + `invalidatesTags` | `action` методы в классах |
| **Сложность** | Более явный boilerplate | Меньше кода, магия через Proxy |
| **Отладка** | Redux DevTools | MobX DevTools |
| **Перфоманс** | Оптимизация через `entityAdapter` | Точечные подписки `observer` |
| **Один запрос для N компонентов** | Автоматически через кэш RTK Query | Вручную через проверку кэша в store |

---

## Схема потока данных

### Redux RTK Flow

```
User Action (клик)
    ↓
dispatch(loginMutation)
    ↓
RTK Query → POST /api/auth/login
    ↓
Ответ сохраняется в store['api'] (кэш RTK Query)
authSlice обновляется (token, user)
    ↓
useSelector / useQuery хуки
    ↓
Все компоненты с этими хуками перерисовываются
```

### MobX Flow

```
User Action (клик)
    ↓
authStore.login(credentials)
    ↓
axios → POST /api/auth/login
    ↓
runInAction(() => { this.user = ...; this.token = ...; })
    ↓
MobX Proxy фиксирует изменение observable
    ↓
Только компоненты-observer, подписанные на user/token,
перерисовываются (точечная реактивность)
```

---

## Кэширование: детальное объяснение

### RTK Query (автоматическое кэширование)

```
1. Первый вызов useGetProfileQuery() → HTTP GET /api/auth/profile
2. Данные сохранены в store['api']['queries']['getProfile(undefined)']
3. Второй вызов useGetProfileQuery() (другой компонент) → кэш найден → БЕЗ HTTP!
4. После PUT /api/auth/profile (invalidatesTags: ['User']) → кэш 'User' сброшен
5. Следующий useGetProfileQuery() → снова делает HTTP запрос
```

RTK Query также поддерживает:
- `pollingInterval` — автоопрос каждые N миллисекунд
- `refetchOnFocus` — обновление при возврате на вкладку
- `refetchOnReconnect` — обновление при восстановлении сети

### MobX (ручное кэширование с TTL)

```typescript
// В каждом store:
private _lastFetched: number | null = null;
private _cacheTTL = 5 * 60 * 1000; // 5 минут в мс

get isCacheValid() {
  return this._lastFetched !== null
    && (Date.now() - this._lastFetched) < this._cacheTTL;
}

async fetchData(force = false) {
  if (!force && this.isCacheValid) return; // ← возвращаем из "кэша" (memory)
  // ... делаем запрос
  this._lastFetched = Date.now(); // ← обновляем метку
}
```

---

## Данные в нескольких частях приложения

### Пример: данные пользователя (`User`) используются в 4 местах

| Компонент | Что отображает |
|-----------|---------------|
| `Header` | Имя пользователя в навигации |
| `Profile` | Полные данные (имя, email, дата регистрации) |
| `UserInfo` | Компактная карточка (имя + кол-во авто + активные сессии) |
| `Sidebar` | Аватар + email пользователя |

В **Redux RTK** — все 4 компонента вызывают `useGetProfileQuery()`, но HTTP-запрос происходит **один раз**, остальные читают кэш.

В **MobX** — все 4 компонента обращаются к `authStore.user`, которое является `observable`. MobX автоматически перерисовывает только те компоненты, которые используют изменившееся поле.

---

## Установка зависимостей

### Redux-приложение

```bash
cd redux-app
npm install @reduxjs/toolkit react-redux
```

### MobX-приложение

```bash
cd mobx-app
npm install mobx mobx-react-lite
```

---

## Итоговая структура монорепозитория

```
Parking_lot/
├── backend/              # Node.js + Express + PostgreSQL API
│   └── src/
│       ├── config/       # JWT конфигурация
│       ├── routes/       # маршруты API
│       └── services/     # бизнес-логика (auth, cars, parking, profile)
│
├── redux-app/            # React + Redux Toolkit + RTK Query
│   └── src/
│       ├── api/          # createApi (RTK Query)
│       ├── store/        # configureStore + slices
│       ├── services/     # injectEndpoints для каждой сущности
│       └── components/   # React-компоненты с useQuery/useMutation
│
├── mobx-app/             # React + MobX + mobx-react-lite
│   └── src/
│       ├── api/          # axios instance
│       ├── stores/       # RootStore + domain stores
│       ├── context/      # StoreContext + StoreProvider
│       └── components/   # observer()-компоненты
│
├── docker-compose.yml    # postgres + backend + frontend
└── nginx/                # проксирование запросов к API
```
