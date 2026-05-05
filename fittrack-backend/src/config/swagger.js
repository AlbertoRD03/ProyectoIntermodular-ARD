const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'FitTrack Backend API',
    version: '1.0.0',
    description: 'Documentacion basica de la API de FitTrack.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['nombre', 'email', 'password'],
        properties: {
          nombre: { type: 'string', example: 'Ana' },
          email: { type: 'string', example: 'ana@test.com' },
          password: { type: 'string', example: '123456' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'ana@test.com' },
          password: { type: 'string', example: '123456' }
        }
      },
      OnboardingRequest: {
        type: 'object',
        properties: {
          fecha_nacimiento: { type: 'string', format: 'date', example: '2000-02-10' },
          genero: { type: 'string', example: 'Masculino' },
          altura_cm: { type: 'number', example: 175 },
          peso_kg: { type: 'number', example: 72.5 },
          nivel_experiencia: { type: 'string', example: 'Principiante' },
          objetivo_principal: { type: 'string', example: 'Perder grasa' }
        }
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          nombre: { type: 'string', example: 'Ana' },
          email: { type: 'string', example: 'ana@test.com' },
          fecha_nacimiento: { type: 'string', format: 'date', example: '2000-02-10' },
          genero: { type: 'string', example: 'Masculino' },
          altura_cm: { type: 'number', example: 175 },
          peso_kg: { type: 'number', example: 72.5 },
          nivel_experiencia: { type: 'string', example: 'Intermedio' },
          objetivo_principal: { type: 'string', example: 'Ganar fuerza' }
        }
      },
      SessionSet: {
        type: 'object',
        required: ['reps', 'peso'],
        properties: {
          reps: { type: 'number', example: 10 },
          peso: { type: 'number', example: 60 },
          rpe: { type: 'number', example: 8 }
        }
      },
      SessionExercise: {
        type: 'object',
        required: ['ejercicio_id', 'nombre_ejercicio', 'sets'],
        properties: {
          ejercicio_id: { type: 'number', example: 12 },
          nombre_ejercicio: { type: 'string', example: 'Press banca' },
          sets: {
            type: 'array',
            items: { $ref: '#/components/schemas/SessionSet' }
          }
        }
      },
      CreateSessionRequest: {
        type: 'object',
        required: ['tipo_rutina'],
        properties: {
          tipo_rutina: { type: 'string', example: 'Fuerza' },
          fecha: { type: 'string', format: 'date-time', example: '2026-02-10T10:00:00Z' },
          ejercicios_realizados: {
            type: 'array',
            items: { $ref: '#/components/schemas/SessionExercise' }
          },
          notas: { type: 'string', example: 'Entreno intenso' },
          duracion_minutos: { type: 'number', example: 60 }
        }
      },
      UpdateSessionRequest: {
        type: 'object',
        properties: {
          tipo_rutina: { type: 'string', example: 'Hipertrofia' },
          fecha: { type: 'string', format: 'date-time', example: '2026-02-10T10:00:00Z' },
          ejercicios_realizados: {
            type: 'array',
            items: { $ref: '#/components/schemas/SessionExercise' }
          },
          notas: { type: 'string', example: 'Ajuste de pesos' },
          duracion_minutos: { type: 'number', example: 55 }
        }
      },
      CreateGoalRequest: {
        type: 'object',
        required: ['tipo', 'valor_inicial', 'valor_objetivo', 'unidad'],
        properties: {
          tipo: { type: 'string', example: 'peso' },
          valor_inicial: { type: 'number', example: 82 },
          valor_objetivo: { type: 'number', example: 75 },
          unidad: { type: 'string', example: 'kg' },
          fecha_limite: { type: 'string', format: 'date', example: '2026-06-01' }
        }
      },
      RegisterGoalProgressRequest: {
        type: 'object',
        required: ['valor_registrado'],
        properties: {
          valor_registrado: { type: 'number', example: 80.5 },
          fecha: { type: 'string', format: 'date-time', example: '2026-02-10T10:00:00Z' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Registro y login' },
    { name: 'Users', description: 'Perfil de usuario' },
    { name: 'Sessions', description: 'Sesiones de entrenamiento' },
    { name: 'Exercises', description: 'Catalogo de ejercicios' },
    { name: 'Dashboard', description: 'Analiticas y estadisticas' },
    { name: 'Gamificacion', description: 'Logros y objetivos' }
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registro de usuario',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login de usuario',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        }
      }
    },
    '/api/users/onboarding': {
      put: {
        tags: ['Users'],
        summary: 'Completar onboarding',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OnboardingRequest' }
            }
          }
        }
      }
    },
    '/api/users/profile': {
      get: { tags: ['Users'], summary: 'Obtener perfil' },
      put: {
        tags: ['Users'],
        summary: 'Actualizar perfil',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' }
            }
          }
        }
      },
      delete: { tags: ['Users'], summary: 'Eliminar cuenta' }
    },
    '/api/sesiones': {
      post: {
        tags: ['Sessions'],
        summary: 'Registrar sesion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSessionRequest' }
            }
          }
        }
      }
    },
    '/api/sesiones/{id}': {
      put: {
        tags: ['Sessions'],
        summary: 'Actualizar sesion',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateSessionRequest' }
            }
          }
        }
      },
      delete: {
        tags: ['Sessions'],
        summary: 'Eliminar sesion',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ]
      }
    },
    '/api/sesiones/historial': {
      get: { tags: ['Sessions'], summary: 'Historial de sesiones' }
    },
    '/api/sesiones/ejercicio/{exerciseId}': {
      get: {
        tags: ['Sessions'],
        summary: 'Historial de un ejercicio',
        parameters: [
          {
            name: 'exerciseId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ]
      }
    },
    '/api/ejercicios': {
      get: {
        tags: ['Exercises'],
        summary: 'Listar ejercicios',
        security: [],
        parameters: [
          {
            name: 'grupo',
            in: 'query',
            required: false,
            schema: { type: 'string' }
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' }
          }
        ]
      }
    },
    '/api/dashboard/stats': {
      get: { tags: ['Dashboard'], summary: 'Estadisticas del dashboard' }
    },
    '/api/gamificacion/logros': {
      get: { tags: ['Gamificacion'], summary: 'Ver logros' }
    },
    '/api/gamificacion/objetivos': {
      post: {
        tags: ['Gamificacion'],
        summary: 'Crear objetivo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateGoalRequest' }
            }
          }
        }
      }
    },
    '/api/gamificacion/objetivos/{id}/progreso': {
      post: {
        tags: ['Gamificacion'],
        summary: 'Registrar progreso',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterGoalProgressRequest' }
            }
          }
        }
      }
    }
  }
};

export default swaggerSpec;
