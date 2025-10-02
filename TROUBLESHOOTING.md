# 🔧 Устранение проблем сборки

## 🚨 Ошибка "RUN npm run build"

### Проблема
```
17 | >>> RUN npm run build
```

### Решение 1: Использовать Nixpacks (рекомендуется)
Railway по умолчанию использует Nixpacks, который лучше подходит для Node.js проектов:

1. **Убедитесь, что у вас есть `nixpacks.toml`:**
   ```toml
   [phases.setup]
   nixPkgs = ['nodejs-18_x', 'npm-9_x']

   [phases.install]
   cmds = ['npm ci --frozen-lockfile']

   [phases.build]
   cmds = ['npm run build']

   [start]
   cmd = 'npm run preview'
   ```

2. **В Railway Dashboard:**
   - Settings → Build → Builder: выберите "Nixpacks"
   - Или удалите Dockerfile, чтобы Railway использовал Nixpacks

### Решение 2: Исправить Dockerfile
Если вы хотите использовать Docker:

1. **Переименуйте Dockerfile:**
   ```bash
   mv Dockerfile Dockerfile.multi
   mv Dockerfile.simple Dockerfile
   ```

2. **Или используйте простой Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   ENV NODE_ENV=production
   ENV PORT=3000
   CMD ["npm", "run", "preview"]
   ```

## 🔍 Другие частые проблемы

### Ошибка зависимостей
```
npm ERR! peer dep missing
```

**Решение:**
```bash
# Локально обновите зависимости
npm install
npm run build

# Закоммитьте обновленный package-lock.json
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Ошибка переменных окружения
```
VITE_SUPABASE_URL is not defined
```

**Решение:**
1. В Railway Dashboard → Settings → Variables
2. Добавьте все необходимые переменные:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_BASE_URL=https://your-backend-api.com
   ```

### Ошибка порта
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Решение:**
Railway автоматически устанавливает переменную `$PORT`. Убедитесь, что в `package.json`:
```json
{
  "scripts": {
    "preview": "vite preview --host 0.0.0.0 --port $PORT"
  }
}
```

### Ошибка сборки Vite
```
Error: Failed to resolve import
```

**Решение:**
1. Проверьте импорты в коде
2. Убедитесь, что все файлы существуют
3. Проверьте пути к файлам

## 🛠️ Отладка

### Просмотр логов
```bash
# Через Railway CLI
railway logs --follow

# Или в Railway Dashboard
# Deployments → [ваш деплой] → View Logs
```

### Локальная проверка сборки
```bash
# Установите зависимости
npm install

# Проверьте сборку
npm run build

# Проверьте preview
npm run preview
```

### Проверка переменных окружения
```bash
# В Railway CLI
railway variables

# Или в Dashboard
# Settings → Variables
```

## 🚀 Рекомендуемый подход

1. **Используйте Nixpacks** (по умолчанию в Railway)
2. **Убедитесь в наличии `nixpacks.toml`**
3. **Проверьте переменные окружения**
4. **Локально протестируйте сборку**

## 📞 Если ничего не помогает

1. **Проверьте логи** в Railway Dashboard
2. **Создайте новый проект** Railway
3. **Используйте простой Dockerfile**
4. **Обратитесь в поддержку Railway**

## 🔄 Быстрый фикс

Если сборка не работает, попробуйте:

1. **Удалите Dockerfile** (чтобы использовать Nixpacks)
2. **Пересоздайте проект** в Railway
3. **Используйте простой конфиг:**

```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview"
  }
}
```
