# 🏌️ Golf Tournament API Server

API REST en TypeScript que reemplaza los endpoints PHP. Conecta directamente a MySQL y sirve JSON limpio al frontend.

## Requisitos

- **Node.js** 18+
- **MySQL** 5.7+ o 8.0+
- **npm** o **bun**

## Instalación

```bash
cd server
npm install
```

## Configuración

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales MySQL:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_de_datos
CORS_ORIGINS=http://localhost:8080,https://golf-hub-redux.lovable.app
LOGOS_BASE_URL=https://alien2019.speitour.mx/logos
```

3. Verifica la conexión:
```bash
npm run db:test
```

## Ejecución

### Desarrollo (con hot-reload)
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | Menú de navegación |
| GET | `/api/sponsors` | Patrocinadores |
| GET | `/api/tournament` | Info del torneo |
| GET | `/api/tournament/stats` | Estadísticas |
| GET | `/api/categories` | Categorías |
| GET | `/api/players/:catId` | Jugadores por categoría |
| GET | `/api/calendario/days` | Días del torneo |
| GET | `/api/calendario/schedules` | Horarios por categoría |
| GET | `/api/resultados` | Todos los resultados |
| GET | `/api/resultados/:categoryId` | Resultados por categoría |
| GET | `/api/salidas` | Resumen de salidas |
| GET | `/api/salidas/:dayId` | Salidas por día |
| GET | `/api/competicion` | Competiciones |
| GET | `/api/competicion/:id` | Detalle competición |
| GET | `/api/competencias` | Competencias (approach, drive, etc.) |
| GET | `/api/competencias/:id` | Detalle competencia |
| GET | `/api/competencias/:id/groups/:groupId` | Jugadores de un grupo |
| GET | `/api/eventos` | Eventos y programa |

## Estructura de la Base de Datos

Las queries esperan las siguientes tablas. Adapta los nombres de columnas según tu esquema MySQL actual:

- `menu_items` - Configuración del menú
- `sponsors` - Patrocinadores
- `tournament` - Info general del torneo
- `categories` - Categorías del torneo
- `players` - Jugadores inscritos
- `clubs` - Clubes con logos
- `tournament_days` - Días del torneo
- `category_schedules` - Horarios por categoría
- `results` - Resultados de rondas
- `foursomes` - Grupos de salida
- `foursome_players` - Jugadores por foursome
- `competitions` - Tipos de competición
- `competition_groups` - Grupos dentro de competición
- `competition_winners` - Ganadores
- `competencias` - Tipos de competencia
- `competencia_columns` - Configuración de columnas
- `competencia_groups` - Grupos por competencia
- `competencia_players` - Jugadores por grupo
- `events` - Programa de eventos
- `event_sorteos` - Sorteos por día

## Despliegue en Producción

### Con PM2 (recomendado)
```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name golf-api
pm2 save
```

### Con systemd
```ini
[Unit]
Description=Golf Tournament API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## CORS

El servidor permite requests desde los orígenes configurados en `CORS_ORIGINS`. 
Asegúrate de incluir tanto tu dominio de desarrollo como el de producción.
