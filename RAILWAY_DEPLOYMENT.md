# Деплой etrnl.chat на Railway

## 🚀 Обзор

Это руководство поможет вам развернуть приложение etrnl.chat на платформе Railway.

## 📋 Предварительные требования

1. **Аккаунт Railway** - зарегистрируйтесь на [railway.app](https://railway.app)
2. **GitHub репозиторий** - код должен быть в GitHub
3. **Supabase проект** - настроенный проект Supabase
4. **Бэкенд API** - работающий бэкенд с эндпоинтами

## 🔧 Настройка проекта

### 1. Подготовка файлов

Проект уже содержит все необходимые файлы для деплоя:

- ✅ `railway.json` - конфигурация Railway
- ✅ `nixpacks.toml` - настройки сборки
- ✅ `Dockerfile` - контейнеризация (опционально)
- ✅ `package.json` - обновлен для продакшена
- ✅ `vite.config.js` - настроен для продакшена

### 2. Переменные окружения

Создайте файл `.env.local` для локальной разработки:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=https://your-backend-api.com
```

## 🚀 Деплой на Railway

### Метод 1: Через Railway Dashboard

1. **Войдите в Railway:**
   - Перейдите на [railway.app](https://railway.app)
   - Войдите через GitHub

2. **Создайте новый проект:**
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите репозиторий `fhhd11/front-beta`

3. **Настройте переменные окружения:**
   - Перейдите в Settings → Variables
   - Добавьте переменные:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     VITE_API_BASE_URL=https://your-backend-api.com
     ```

4. **Запустите деплой:**
   - Railway автоматически начнет сборку
   - Дождитесь завершения деплоя

### Метод 2: Через Railway CLI

1. **Установите Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Войдите в Railway:**
   ```bash
   railway login
   ```

3. **Инициализируйте проект:**
   ```bash
   railway init
   ```

4. **Добавьте переменные окружения:**
   ```bash
   railway variables set VITE_SUPABASE_URL=https://your-project.supabase.co
   railway variables set VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   railway variables set VITE_API_BASE_URL=https://your-backend-api.com
   ```

5. **Запустите деплой:**
   ```bash
   railway up
   ```

## ⚙️ Конфигурация

### Railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Nixpacks.toml

```toml
[phases.setup]
nixPkgs = ['nodejs-18_x', 'npm-9_x']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm run preview'
```

## 🔍 Мониторинг и логи

### Просмотр логов

1. **В Railway Dashboard:**
   - Перейдите в ваш проект
   - Откройте вкладку "Deployments"
   - Нажмите на последний деплой
   - Просмотрите логи сборки и запуска

2. **Через CLI:**
   ```bash
   railway logs
   ```

### Health Check

Приложение предоставляет health check эндпоинт:
- URL: `https://your-app.railway.app/health`
- Ответ: `OK`

## 🛠️ Устранение неполадок

### Частые проблемы

1. **Ошибка сборки:**
   - Проверьте логи сборки в Railway Dashboard
   - Убедитесь, что все зависимости указаны в `package.json`

2. **Ошибка переменных окружения:**
   - Проверьте, что все переменные добавлены в Railway
   - Убедитесь, что переменные начинаются с `VITE_`

3. **Ошибка запуска:**
   - Проверьте, что порт настроен правильно
   - Убедитесь, что `startCommand` указан в `railway.json`

### Логи для отладки

```bash
# Просмотр логов в реальном времени
railway logs --follow

# Просмотр логов конкретного сервиса
railway logs --service your-service-name
```

## 🔄 Автоматический деплой

Railway автоматически деплоит при каждом push в main ветку:

1. **Push в main:**
   ```bash
   git add .
   git commit -m "Update for deployment"
   git push origin main
   ```

2. **Railway автоматически:**
   - Обнаружит изменения
   - Запустит сборку
   - Развернет новую версию

## 📊 Производительность

### Оптимизации

1. **Vite Build:**
   - Минификация включена
   - Chunk splitting настроен
   - Source maps отключены для продакшена

2. **Caching:**
   - Railway кэширует зависимости
   - Статические файлы кэшируются CDN

3. **Health Checks:**
   - Настроены для быстрого обнаружения проблем
   - Автоматический перезапуск при сбоях

## 🔐 Безопасность

### Переменные окружения

- ✅ Никогда не коммитьте `.env` файлы
- ✅ Используйте Railway Variables для секретов
- ✅ Ограничьте доступ к переменным

### CORS настройки

Убедитесь, что ваш бэкенд разрешает запросы с домена Railway:
```
https://your-app.railway.app
```

## 📈 Масштабирование

### Автоматическое масштабирование

Railway автоматически масштабирует ваше приложение:
- Минимум: 1 инстанс
- Максимум: зависит от плана
- CPU и RAM: автоматическое выделение

### Мониторинг ресурсов

- Отслеживайте использование в Railway Dashboard
- Настройте алерты при превышении лимитов
- Оптимизируйте код при необходимости

## 🎯 Следующие шаги

После успешного деплоя:

1. **Настройте домен:**
   - Добавьте custom domain в Railway
   - Настройте SSL сертификат

2. **Мониторинг:**
   - Настройте алерты
   - Подключите аналитику

3. **CI/CD:**
   - Настройте автоматические тесты
   - Добавьте staging окружение

## 📞 Поддержка

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Railway Discord:** [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues:** Создайте issue в репозитории проекта
