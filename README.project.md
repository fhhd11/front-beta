# 🚀 etrl.chat - Полный проект

Полный проект включает основное приложение и лендинг страницу для платформы etrl.chat - персонализированных AI-ассистентов с долгосрочной памятью.

## 📁 Структура проекта

```
etrl-beta/
├── front-beta/          # Основное приложение (Vue 3 + Supabase)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── landing/             # Лендинг страница
    ├── src/
    ├── public/
    ├── package.json
    ├── README.md
    └── DEPLOY.md
```

## 🚀 Быстрый старт

### Запуск основного приложения

```bash
cd front-beta
npm install
npm run dev
# Приложение запустится на http://localhost:3000
```

### Запуск лендинга

```bash
cd landing
npm install
npm run dev
# Лендинг запустится на http://localhost:5173
```

### Запуск обоих проектов одновременно

**Windows (PowerShell):**
```powershell
# В первом терминале
cd front-beta
npm run dev

# Во втором терминале
cd landing
npm run dev
```

**Linux/macOS:**
```bash
# Запустить оба проекта в фоне
cd front-beta && npm run dev &
cd landing && npm run dev &
```

## 🎯 Основные компоненты

### front-beta (Основное приложение)

**Особенности:**
- ✅ AI чат с бесконечной историей
- ✅ Персонализированные агенты
- ✅ Аутентификация через Supabase
- ✅ Интеллектуальное управление памятью
- ✅ Автоматическая суммаризация контекста (при 80%+ заполнении)
- ✅ Защита от ошибок суммаризации (минимум 15 сообщений)
- ✅ Web поиск и выполнение кода
- ✅ Sleep-time обработка

**Технологии:**
- Vue 3 + Vue Router
- Supabase (Auth + Database)
- Letta AI Client
- Tailwind CSS
- Vite

**Запуск:**
```bash
cd front-beta
npm install
npm run dev
```

**Порт:** `http://localhost:3000`

### landing (Лендинг)

**Особенности:**
- ✅ Современный дизайн с glassmorphism
- ✅ Плавные scroll-анимации
- ✅ Полная адаптивность
- ✅ SEO оптимизация
- ✅ FAQ секция
- ✅ Roadmap продукта

**Технологии:**
- Vue 3
- Tailwind CSS
- Vite
- Intersection Observer API

**Запуск:**
```bash
cd landing
npm install
npm run dev
```

**Порт:** `http://localhost:5173`

## 🔧 Настройка окружения

### front-beta

Создайте `.env` файл:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_LETTA_API_URL=your_letta_api_url
VITE_LETTA_API_KEY=your_letta_api_key
```

См. `front-beta/env.example` для деталей.

### landing

Создайте `.env.local` файл:
```env
VITE_APP_URL=http://localhost:3000
```

При деплое замените на production URL.

## 🚀 Деплой

### Основное приложение (front-beta)

**Railway.app:**
```bash
cd front-beta
railway up
```

См. `front-beta/RAILWAY_DEPLOYMENT.md` для деталей.

### Лендинг

**Netlify:**
```bash
cd landing
npm run build
netlify deploy --prod
```

**Vercel:**
```bash
cd landing
vercel --prod
```

См. `landing/DEPLOY.md` для всех вариантов деплоя.

## 📖 Документация

### front-beta документы:
- `README.md` - Основная документация
- `BACKEND_INTEGRATION.md` - Интеграция с бэкендом
- `SUPABASE_SETUP.md` - Настройка Supabase
- `CONTEXT_WINDOW.md` - Управление контекстным окном и автосуммаризация
- `RAILWAY_DEPLOYMENT.md` - Деплой на Railway
- `TROUBLESHOOTING.md` - Решение проблем

### landing документы:
- `README.md` - Документация лендинга
- `DEPLOY.md` - Инструкции по деплою

## 🔗 Интеграция

Лендинг автоматически интегрируется с основным приложением:
- Кнопки "Попробовать" ведут на основное приложение
- URL настраивается через переменную окружения `VITE_APP_URL`

**Development:**
```
Landing: http://localhost:5173
App: http://localhost:3000
```

**Production:**
```
Landing: https://etrl.chat (или ваш домен)
App: https://app.etrl.chat (или ваш домен)
```

## 🎨 Дизайн система

Оба проекта используют единую дизайн систему:

**Цвета:**
- Фон: `#141414`
- Темный фон: `#0a0a0a`
- Акцент: `#6366f1` (indigo)

**Шрифт:**
- Roboto Mono - моноширинный шрифт

**Эффекты:**
- Glassmorphism (прозрачность + blur)
- Плавные анимации и transitions
- Градиентный текст для акцентов

## 🛠 Разработка

### Установка зависимостей для всех проектов

```bash
# Windows PowerShell
cd front-beta; npm install; cd ..; cd landing; npm install; cd ..

# Linux/macOS
(cd front-beta && npm install) && (cd landing && npm install)
```

### Сборка всех проектов

```bash
# Windows PowerShell
cd front-beta; npm run build; cd ..; cd landing; npm run build; cd ..

# Linux/macOS
(cd front-beta && npm run build) && (cd landing && npm run build)
```

## 📊 Performance

Оба проекта оптимизированы для производительности:
- Code splitting
- Asset optimization
- CSS purging
- Минимальные зависимости
- Lazy loading

## 🔒 Безопасность

- ✅ Все sensitive данные в environment variables
- ✅ HTTPS для production
- ✅ Supabase Row Level Security
- ✅ API ключи защищены

## 🤝 Контрибьюция

1. Fork проект
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📄 Лицензия

© 2025 etrl.chat. Все права защищены.

---

## 📞 Поддержка

Если у вас возникли вопросы:
- Проверьте документацию в соответствующих README файлах
- См. `front-beta/TROUBLESHOOTING.md` для решения проблем
- Создайте issue в репозитории

---

**Создано с ❤️ для etrl.chat**

