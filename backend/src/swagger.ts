/**
 * OpenAPI 3.0 — контракт API приложения «Парковка»
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Parking Lot API',
    description: 'API для приложения парковки: регистрация, автомобили, парковочные места и бронирование.',
    version: '1.0.0',
    contact: {
      name: 'Команда разработки',
      email: 'dev@parking.app'
    }
  },
  servers: [
    { url: '/api', description: 'Базовый путь API (относительно хоста)' },
    { url: 'http://localhost:3000/api', description: 'Локальный сервер разработки' }
  ],
  tags: [
    { name: 'Health', description: 'Проверка работоспособности API' },
    { name: 'Auth', description: 'Регистрация, вход, управление профилем' },
    { name: 'Cars', description: 'Управление автомобилями пользователя' },
    { name: 'Profile', description: 'Объединенная информация профиля' },
    { name: 'Selection', description: 'Контекст для выбора парковки' },
    { name: 'Parking', description: 'Парковочные места и бронирование' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Токен, полученный при логине или регистрации. Заголовок: Authorization: Bearer <token>',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { 
          error: { type: 'string', description: 'Сообщение об ошибке' },
          statusCode: { type: 'integer', description: 'HTTP код ошибки' }
        },
        example: {
          error: 'Пользователь не найден',
          statusCode: 404
        }
      },
      User: {
        type: 'object',
        required: ['id', 'name', 'email'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Петров' },
          email: { type: 'string', format: 'email', example: 'petrov@example.com' },
        },
      },
      Car: {
        type: 'object',
        required: ['id', 'user_id', 'type', 'auto_number'],
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 1 },
          type: { 
            type: 'string', 
            enum: ['sedan', 'suv', 'hatchback', 'electric'], 
            description: 'Тип ТС',
            example: 'sedan'
          },
          mark: { type: 'string', example: 'Toyota' },
          auto_number: { type: 'string', example: 'А123БВ777' },
          color: { type: 'string', example: 'черный' },
          notes: { type: 'string', example: 'Есть детское кресло' },
          created_at: { 
            type: 'string', 
            format: 'date-time',
            example: '2024-01-15T10:30:00Z'
          },
        },
      },
      ParkingPlace: {
        type: 'object',
        required: ['id_parking', 'floor', 'section', 'place_num', 'is_free', 'type_parking'],
        properties: {
          id_parking: { type: 'integer', example: 101 },
          floor: { type: 'integer', example: 2 },
          section: { type: 'string', example: 'A' },
          place_num: { type: 'integer', example: 15 },
          is_free: { type: 'boolean', example: true },
          type_parking: { 
            type: 'string', 
            enum: ['standard', 'electric', 'handicap'],
            example: 'standard',
            description: 'Тип парковочного места'
          },
        },
      },
      BookingSession: {
        type: 'object',
        required: ['id_session', 'car_id', 'id_parking', 'time_start', 'price'],
        properties: {
          id_session: { type: 'integer', example: 1001 },
          car_id: { type: 'integer', example: 1 },
          id_parking: { type: 'integer', example: 101 },
          type_parking: { 
            type: 'string',
            enum: ['standard', 'electric', 'handicap'],
            example: 'standard'
          },
          time_start: { 
            type: 'string', 
            format: 'date-time',
            example: '2024-01-15T10:30:00Z'
          },
          time_end: { 
            type: 'string', 
            format: 'date-time',
            example: '2024-01-15T12:30:00Z'
          },
          price: { 
            type: 'number', 
            format: 'float',
            example: 250.50
          },
          is_done_session: { 
            type: 'integer', 
            enum: [0, 1],
            example: 0,
            description: '0 - активна, 1 - завершена'
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Проверка работы API',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'Сервис доступен',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    status: { type: 'string', example: 'ok' }, 
                    message: { type: 'string', example: 'Сервис работает' } 
                  },
                },
              },
            },
          },
          '500': { 
            description: 'Ошибка сервера', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Регистрация пользователя',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Иван Петров' },
                  email: { type: 'string', format: 'email', example: 'ivan@example.com' },
                  password: { type: 'string', format: 'password', minLength: 6, example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Успешная регистрация',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Регистрация успешна' },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    refreshToken: { type: 'string', description: 'Refresh token (хранится в БД по SHA-256)' },
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Ошибка валидации', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '409': { 
            description: 'Пользователь с таким email уже существует', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Вход в систему',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'ivan@example.com' },
                  password: { type: 'string', format: 'password', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Успешный вход',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Вход выполнен успешно' },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    refreshToken: { type: 'string', description: 'Refresh token' },
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Неверные данные', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Неверный email или пароль', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Обновить access token по refresh token',
        tags: ['Auth'],
        description: 'Передаётся действующий refresh token; при успехе выдаются новые access и refresh (ротация).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string', description: 'Refresh token, полученный при входе/регистрации' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Новая пара токенов',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', description: 'Новый JWT access token' },
                    refreshToken: { type: 'string', description: 'Новый refresh token' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Нет refreshToken в теле',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'Недействительный или истёкший refresh token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Выход (отозвать refresh-сессии на сервере)',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        description: 'Удаляет все refresh-токены пользователя. Клиенту всё равно нужно очистить localStorage.',
        responses: {
          '200': {
            description: 'Успешно',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string', example: 'Выход выполнен' } },
                },
              },
            },
          },
          '401': {
            description: 'Нет или неверный access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Получить информацию о текущем пользователе',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Данные пользователя',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    user: { $ref: '#/components/schemas/User' } 
                  },
                },
              },
            },
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Пользователь не найден', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
      put: {
        summary: 'Обновить имя пользователя',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { 
                  name: { type: 'string', example: 'Петр Иванов' } 
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Имя пользователя обновлено',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    user: { $ref: '#/components/schemas/User' } 
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Пустое имя', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Пользователь не найден', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/auth/me/password': {
      put: {
        summary: 'Сменить пароль',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', format: 'password', example: 'oldpass123' },
                  newPassword: { type: 'string', format: 'password', minLength: 6, example: 'newpass123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { 
            description: 'Пароль изменён', 
            content: { 
              'application/json': { 
                schema: { 
                  type: 'object', 
                  properties: { 
                    message: { type: 'string', example: 'Пароль успешно изменен' } 
                  } 
                } 
              } 
            } 
          },
          '400': { 
            description: 'Неверный текущий пароль или короткий новый', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/cars': {
      get: {
        summary: 'Получить автомобиль текущего пользователя',
        tags: ['Cars'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Автомобиль пользователя',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    car: { $ref: '#/components/schemas/Car' } 
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Ошибка запроса', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Автомобиль не найден', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
      post: {
        summary: 'Добавить автомобиль',
        tags: ['Cars'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['autoNumber', 'type'],
                properties: {
                  autoNumber: { type: 'string', example: 'А123БВ777' },
                  type: { 
                    type: 'string', 
                    enum: ['sedan', 'suv', 'hatchback', 'electric'],
                    example: 'sedan' 
                  },
                  mark: { type: 'string', example: 'Toyota' },
                  color: { type: 'string', example: 'черный' },
                  notes: { type: 'string', example: 'Есть детское кресло' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Автомобиль создан',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Автомобиль успешно добавлен' },
                    car: { $ref: '#/components/schemas/Car' },
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Ошибка валидации', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '409': { 
            description: 'Автомобиль с таким номером уже существует', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/cars/{carId}': {
      put: {
        summary: 'Обновить автомобиль',
        tags: ['Cars'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            name: 'carId', 
            in: 'path', 
            required: true, 
            schema: { type: 'integer' },
            description: 'ID автомобиля'
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['autoNumber', 'type'],
                properties: {
                  autoNumber: { type: 'string', example: 'А123БВ777' },
                  type: { 
                    type: 'string', 
                    enum: ['sedan', 'suv', 'hatchback', 'electric'],
                    example: 'suv' 
                  },
                  mark: { type: 'string', example: 'Honda' },
                  color: { type: 'string', example: 'белый' },
                  notes: { type: 'string', example: 'Обновленная информация' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Автомобиль обновлён',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Автомобиль успешно обновлен' },
                    car: { $ref: '#/components/schemas/Car' },
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Ошибка валидации', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '403': { 
            description: 'Доступ запрещен (не ваш автомобиль)', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Автомобиль не найден', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
      delete: {
        summary: 'Удалить автомобиль',
        tags: ['Cars'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            name: 'carId', 
            in: 'path', 
            required: true, 
            schema: { type: 'integer' },
            description: 'ID автомобиля'
          },
        ],
        responses: {
          '200': { 
            description: 'Автомобиль удалён', 
            content: { 
              'application/json': { 
                schema: { 
                  type: 'object', 
                  properties: { 
                    message: { type: 'string', example: 'Автомобиль успешно удален' } 
                  } 
                } 
              } 
            } 
          },
          '400': { 
            description: 'Ошибка запроса', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '403': { 
            description: 'Доступ запрещен (не ваш автомобиль)', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Автомобиль не найден', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/profile': {
      get: {
        summary: 'Получить профиль пользователя (пользователь + автомобиль)',
        tags: ['Profile'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Данные профиля',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    car: { 
                      oneOf: [
                        { $ref: '#/components/schemas/Car' }, 
                        { type: 'null' }
                      ] 
                    },
                  },
                },
                examples: {
                  withCar: {
                    value: {
                      user: { id: 1, name: 'Иван Петров', email: 'ivan@example.com' },
                      car: {
                        id: 1,
                        user_id: 1,
                        type: 'sedan',
                        mark: 'Toyota',
                        auto_number: 'А123БВ777',
                        color: 'черный',
                        created_at: '2024-01-15T10:30:00Z'
                      }
                    }
                  },
                  withoutCar: {
                    value: {
                      user: { id: 1, name: 'Иван Петров', email: 'ivan@example.com' },
                      car: null
                    }
                  }
                }
              },
            },
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Пользователь не найден', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '500': { 
            description: 'Ошибка сервера', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/selection-context': {
      get: {
        summary: 'Контекст для выбора парковки (пользователь + автомобиль)',
        tags: ['Selection'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Данные для подстановки типа авто на странице выбора',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    car: { 
                      oneOf: [
                        { $ref: '#/components/schemas/Car' }, 
                        { type: 'null' }
                      ] 
                    },
                  },
                },
              },
            },
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Пользователь не найден', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/parking/places': {
      get: {
        summary: 'Получить список парковочных мест',
        tags: ['Parking'],
        parameters: [
          { 
            name: 'floor', 
            in: 'query', 
            required: false, 
            schema: { type: 'integer' }, 
            description: 'Фильтр по этажу',
            example: 2
          },
          {
            name: 'type',
            in: 'query',
            required: false,
            schema: { 
              type: 'string',
              enum: ['standard', 'electric', 'handicap']
            },
            description: 'Фильтр по типу места'
          },
          {
            name: 'is_free',
            in: 'query',
            required: false,
            schema: { type: 'boolean' },
            description: 'Фильтр по доступности (только свободные)'
          }
        ],
        responses: {
          '200': {
            description: 'Список парковочных мест',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    places: { 
                      type: 'array', 
                      items: { $ref: '#/components/schemas/ParkingPlace' } 
                    } 
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Некорректные параметры фильтрации', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '500': { 
            description: 'Ошибка сервера', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/parking/places/{id}': {
      get: {
        summary: 'Получить информацию о конкретном парковочном месте',
        tags: ['Parking'],
        parameters: [
          { 
            name: 'id', 
            in: 'path', 
            required: true, 
            schema: { type: 'integer' },
            description: 'ID парковочного места',
            example: 101
          },
        ],
        responses: {
          '200': {
            description: 'Информация о месте',
            content: {
              'application/json': { 
                schema: { $ref: '#/components/schemas/ParkingPlace' } 
              },
            },
          },
          '400': { 
            description: 'Некорректный ID', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Место не найдено', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '500': { 
            description: 'Ошибка сервера', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/parking/booking': {
      get: {
        summary: 'Получить список сессий бронирования текущего пользователя',
        tags: ['Parking'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'active_only',
            in: 'query',
            required: false,
            schema: { type: 'boolean' },
            description: 'Только активные сессии'
          }
        ],
        responses: {
          '200': {
            description: 'Список сессий',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    sessions: { 
                      type: 'array', 
                      items: { $ref: '#/components/schemas/BookingSession' } 
                    } 
                  },
                },
              },
            },
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '500': { 
            description: 'Ошибка сервера', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
      post: {
        summary: 'Создать новое бронирование',
        tags: ['Parking'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['car_id', 'id_parking', 'time_start', 'time_end', 'price'],
                properties: {
                  car_id: { type: 'integer', example: 1 },
                  id_parking: { type: 'integer', example: 101 },
                  type_parking: { 
                    type: 'string',
                    enum: ['standard', 'electric', 'handicap'],
                    description: 'Опционально, иначе берётся с места',
                    example: 'standard'
                  },
                  time_start: { 
                    type: 'string', 
                    format: 'date-time',
                    description: 'Дата и время начала',
                    example: '2024-01-15T10:30:00Z'
                  },
                  time_end: { 
                    type: 'string', 
                    format: 'date-time',
                    description: 'Дата и время окончания',
                    example: '2024-01-15T12:30:00Z'
                  },
                  price: { 
                    type: 'number', 
                    format: 'float',
                    description: 'Стоимость бронирования',
                    example: 250.50
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Бронирование создано',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    message: { type: 'string', example: 'Бронирование успешно создано' },
                    session: { $ref: '#/components/schemas/BookingSession' } 
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Не указаны поля или место занято', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '403': { 
            description: 'Автомобиль не принадлежит пользователю', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Место не найдено', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '409': { 
            description: 'Место уже забронировано на указанное время', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '500': { 
            description: 'Ошибка сервера', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
    '/parking/booking/{id}/done': {
      patch: {
        summary: 'Завершить сессию бронирования',
        tags: ['Parking'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            name: 'id', 
            in: 'path', 
            required: true, 
            schema: { type: 'integer' }, 
            description: 'ID сессии бронирования',
            example: 1001
          },
        ],
        responses: {
          '200': {
            description: 'Сессия завершена',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    message: { type: 'string', example: 'Сессия успешно завершена' } 
                  },
                },
              },
            },
          },
          '400': { 
            description: 'Некорректный ID или сессия уже завершена', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '401': { 
            description: 'Не авторизован', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '403': { 
            description: 'Доступ запрещен (не ваша сессия)', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '404': { 
            description: 'Сессия не найдена', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
          '500': { 
            description: 'Ошибка сервера', 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } 
          },
        },
      },
    },
  },
};