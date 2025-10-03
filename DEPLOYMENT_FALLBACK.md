# 🔄 Fallback Deployment Options

## Если основной деплой не работает

### Вариант 1: Простой Nixpacks

1. **Переименуйте конфигурацию:**
   ```bash
   mv nixpacks.toml nixpacks.original.toml
   mv nixpacks.simple.toml nixpacks.toml
   ```

2. **Закоммитьте изменения:**
   ```bash
   git add nixpacks.toml nixpacks.original.toml
   git commit -m "Switch to simple nixpacks config"
   git push
   ```

### Вариант 2: Тестовый сервер

1. **Измените start команду в railway.json:**
   ```json
   {
     "deploy": {
       "startCommand": "npm run start:test"
     }
   }
   ```

2. **Закоммитьте изменения:**
   ```bash
   git add railway.json
   git commit -m "Use test server for debugging"
   git push
   ```

### Вариант 3: Vite Preview

1. **Измените start команду в railway.json:**
   ```json
   {
     "deploy": {
       "startCommand": "npm run start:preview"
     }
   }
   ```

2. **Измените health check путь:**
   ```json
   {
     "deploy": {
       "healthcheckPath": "/"
     }
   }
   ```

### Вариант 4: Минимальный Express

1. **Создайте минимальный server.js:**
   ```javascript
   import express from 'express'
   const app = express()
   const port = process.env.PORT || 3000
   
   app.get('/health', (req, res) => res.send('OK'))
   app.get('/', (req, res) => res.send('Hello Railway!'))
   
   app.listen(port, '0.0.0.0', () => {
     console.log(`Server running on ${port}`)
   })
   ```

## Отладка

### Проверка логов
```bash
# В Railway Dashboard
# Deployments → [ваш деплой] → View Logs
```

### Локальное тестирование
```bash
# Сборка
npm run build:simple

# Тест сервера
npm start

# Тест health check
curl http://localhost:3000/health
```

### Переменные окружения
Убедитесь, что в Railway Dashboard → Settings → Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=https://your-backend-api.com
```

## Порядок действий при проблемах

1. **Проверьте логи** в Railway Dashboard
2. **Попробуйте тестовый сервер** (Вариант 2)
3. **Попробуйте простой Nixpacks** (Вариант 1)
4. **Попробуйте Vite Preview** (Вариант 3)
5. **Создайте минимальный сервер** (Вариант 4)
