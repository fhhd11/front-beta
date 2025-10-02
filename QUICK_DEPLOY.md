# 🚀 Быстрый деплой на Railway

## ⚡ 5-минутный деплой

### 1. Подготовка (30 сек)
- Убедитесь, что код в GitHub: `https://github.com/fhhd11/front-beta`
- Получите ключи Supabase и URL бэкенда

### 2. Создание проекта Railway (1 мин)
1. Идите на [railway.app](https://railway.app)
2. Нажмите "New Project" → "Deploy from GitHub repo"
3. Выберите `fhhd11/front-beta`

### 3. Настройка переменных (2 мин)
В Settings → Variables добавьте:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=https://your-backend-api.com
```

### 4. Деплой (1-2 мин)
- Railway автоматически начнет сборку
- Дождитесь зеленого статуса "Deployed"

### 5. Проверка (30 сек)
- Откройте URL приложения
- Проверьте `/health` эндпоинт

## 🎯 Готово!

Ваше приложение будет доступно по адресу:
`https://your-app-name.railway.app`

## 📚 Подробная документация
См. [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) для детальной информации.
