# 🔧 Устранение проблем сборки

## 🚨 Ошибка "RUN npm run build"

### Проблема 1: Terser not found
```
[vite:terser] terser not found. Since Vite v3, terser has become an optional dependency. You need to install it.
```

**Решение:**
1. **Добавьте terser в devDependencies:**
   ```json
   {
     "devDependencies": {
       "terser": "^5.24.0"
     }
   }
   ```

2. **Или используйте esbuild (быстрее):**
   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       minify: 'esbuild' // вместо 'terser'
     }
   })
   ```

3. **Или отключите минификацию:**
   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       minify: false
     }
   })
   ```

### Проблема 2: Package lock file out of sync
```
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error Missing: terser@5.44.0 from lock file
```

**Решение:**
1. **Обновите package-lock.json локально:**
   ```bash
   npm install
   git add package-lock.json
   git commit -m "Update package-lock.json"
   git push
   ```

2. **Или используйте npm install вместо npm ci:**
   ```dockerfile
   # В Dockerfile замените
   RUN npm ci
   # на
   RUN npm install
   ```

### Проблема 3: Health check failed
```
1/1 replicas never became healthy!
Healthcheck failed!
```

**Решение:**
1. **Проверьте, что приложение запускается:**
   ```bash
   # Локально протестируйте
   npm run build
   npm start
   # Откройте http://localhost:3000/health
   ```

2. **Убедитесь в правильности health check пути:**
   ```json
   // railway.json
   {
     "deploy": {
       "healthcheckPath": "/health",
       "healthcheckTimeout": 300
     }
   }
   ```

3. **Проверьте порт и хост:**
   ```javascript
   // server.js должен слушать на 0.0.0.0:PORT
   app.listen(port, '0.0.0.0', () => {
     console.log(`Server running on port ${port}`)
   })
   ```

### Проблема 4: Общая ошибка сборки
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
