# Настройка Supabase Auth для etrl.chat

## 🚀 Быстрый старт

### 1. Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации

### 2. Получение ключей

1. В панели Supabase перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://your-project.supabase.co`)
   - **anon public** ключ

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Настройка аутентификации в Supabase

1. Перейдите в **Authentication** → **Settings**
2. Настройте **Site URL**: `http://localhost:3002` (для разработки)
3. Добавьте **Redirect URLs**:
   - `http://localhost:3002/auth/callback`
   - `http://localhost:3002/` (для продакшена)

### 5. Настройка email (опционально)

1. В **Authentication** → **Settings** → **SMTP Settings**
2. Настройте SMTP для отправки писем подтверждения
3. Или используйте встроенный email провайдер Supabase

## 🔧 Конфигурация

### JWT токены

Приложение автоматически:
- ✅ Сохраняет JWT токены в `localStorage`
- ✅ Обновляет токены автоматически
- ✅ Обрабатывает истечение сессий
- ✅ Слушает изменения состояния аутентификации

### Безопасность

- 🔒 Токены хранятся в `localStorage` с ключом `etrl-chat-auth-token`
- 🔒 Автоматическое обновление токенов
- 🔒 Обработка ошибок и fallback для localStorage
- 🔒 Защита маршрутов через router guards

## 📱 Функциональность

### Регистрация
- ✅ Валидация email и пароля
- ✅ Индикатор силы пароля
- ✅ Подтверждение email (если включено)
- ✅ Обработка ошибок

### Вход
- ✅ Валидация данных
- ✅ Показ/скрытие пароля
- ✅ "Запомнить меня"
- ✅ Восстановление пароля

### Управление сессией
- ✅ Автоматический вход при наличии валидной сессии
- ✅ Выход из системы
- ✅ Отображение информации о пользователе
- ✅ Защита маршрутов

## 🛠️ API методы

### useAuth composable

```javascript
import { useAuth } from '@/composables/useAuth.js'

const {
  // State
  user,           // Текущий пользователь
  session,        // Текущая сессия
  loading,        // Состояние загрузки
  error,          // Ошибки
  
  // Computed
  isAuthenticated, // Авторизован ли пользователь
  userName,        // Имя пользователя
  userEmail,       // Email пользователя
  
  // Methods
  signUp,          // Регистрация
  signIn,          // Вход
  signOut,         // Выход
  resetPassword,   // Сброс пароля
  updateProfile    // Обновление профиля
} = useAuth()
```

## 🔍 Отладка

### Проверка состояния

```javascript
// В консоли браузера
console.log('User:', user.value)
console.log('Session:', session.value)
console.log('Is authenticated:', isAuthenticated.value)
```

### Логи

Все операции аутентификации логируются в консоль для отладки.

## 🚨 Важные замечания

1. **Никогда не коммитьте** `.env.local` файл
2. **Используйте HTTPS** в продакшене
3. **Настройте CORS** в Supabase для вашего домена
4. **Регулярно обновляйте** зависимости Supabase

## 📚 Дополнительные ресурсы

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Vue.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-vue-js)
- [JWT Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
