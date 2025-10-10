# File Manager - Менеджер файлов

## Описание

File Manager - это функциональность для управления файлами пользователя в приложении. Позволяет загружать файлы в хранилище Letta, просматривать загруженные файлы и удалять их. Файлы могут быть привязаны к агенту для использования в разговоре.

## Архитектура

### Компоненты

1. **FileManager.vue** - UI компонент для отображения меню файлов
2. **useFiles.js** - Composable для управления состоянием и логикой работы с файлами
3. **files.js** - API клиент для взаимодействия с Letta Files API

### Структура данных

#### Source (Хранилище файлов)
```javascript
{
  id: string,
  name: string,
  description: string,
  metadata: {
    user_id: string,
    created_by: string
  },
  created_at: string
}
```

#### File
```javascript
{
  id: string,
  name: string,
  metadata: {
    original_name: string,
    size: number,
    type: string,
    uploaded_at: string
  },
  created_at: string
}
```

## Использование

### В компоненте

```vue
<template>
  <FileManager :isDisabled="isStreaming" />
</template>

<script setup>
import FileManager from './FileManager.vue'
import { ref } from 'vue'

const isStreaming = ref(false)
</script>
```

### В composable

```javascript
import { useFiles } from '@/composables/useFiles'

const {
  files,
  sortedFiles,
  isLoading,
  error,
  uploadProgress,
  isUploading,
  hasFiles,
  loadFiles,
  uploadFile,
  deleteFile,
  attachToAgent,
  detachFromAgent,
  formatFileSize
} = useFiles()

// Загрузить файлы
await loadFiles()

// Загрузить новый файл
await uploadFile(file)

// Удалить файл
await deleteFile(fileId)

// Привязать к агенту
await attachToAgent(agentId)
```

## API Endpoints

Все эндпоинты используют префикс `/api/v1/letta/`

### Folders (Папки)

- `GET /folders` - Получить список папок
- `GET /folders/{folder_id}` - Получить папку по ID
- `GET /folders/name/{folder_name}` - Получить папку по имени
- `POST /folders` - Создать папку
- `PATCH /folders/{folder_id}` - Обновить папку
- `DELETE /folders/{folder_id}` - Удалить папку

### Sources (Хранилища)

- `GET /sources` - Получить список хранилищ
- `POST /sources` - Создать хранилище
- `GET /sources/name/{source_name}` - Получить хранилище по имени

### Files (Файлы)

- `GET /sources/{source_id}/files` - Получить файлы из хранилища
- `POST /sources/{source_id}/upload` - Загрузить файл
- `GET /sources/{source_id}/files/{file_id}` - Получить метаданные файла
- `DELETE /sources/{source_id}/files/{file_id}` - Удалить файл

### Agent Integration

- `POST /agents/{agent_id}/sources/{source_id}` - Привязать хранилище к агенту
- `DELETE /agents/{agent_id}/sources/{source_id}` - Отвязать хранилище от агента
- `GET /agents/{agent_id}/sources` - Получить хранилища агента

## Особенности реализации

### Автоматическое создание хранилища

При первом использовании File Manager автоматически создается персональное хранилище пользователя с именем `user_{user_id}_files`.

### Ограничения

- Максимальный размер файла: **10 MB**
- Поддерживаемые типы файлов: все типы
- Файлы хранятся в Letta Source

### Валидация

```javascript
// Проверка размера файла
fileUtils.isValidFileSize(file, 10) // 10 MB max

// Проверка типа файла
fileUtils.isValidFileType(file, ['pdf', 'txt', 'doc'])

// Форматирование размера
fileUtils.formatFileSize(1024) // "1 KB"
```

### Состояние загрузки

Компонент отображает прогресс загрузки:
- `uploadProgress` - процент загрузки (0-100)
- `isUploading` - флаг процесса загрузки

### Обработка ошибок

Все методы API возвращают объект с `error`:

```javascript
const { data, error } = await filesApi.uploadFile(sourceId, file)

if (error) {
  console.error('Upload failed:', error)
}
```

## UI/UX

### Кнопка File Manager

- Расположена слева от поля ввода сообщений
- Иконка папки с бейджем количества файлов
- Синий цвет при наличии файлов
- Отключена во время стриминга

### Меню файлов

- Выпадающее меню над кнопкой
- Секции:
  - Заголовок с кнопкой закрытия
  - Область загрузки файлов
  - Список файлов
  - Подвал с количеством файлов

### Список файлов

- Иконка файла
- Имя файла (с ellipsis)
- Размер и дата загрузки
- Кнопка удаления

### Анимации

- Плавное появление/исчезновение меню (slide-fade)
- Спиннер загрузки
- Прогресс-бар загрузки файла

## Интеграция с агентом

Для использования файлов в разговоре с агентом необходимо привязать хранилище:

```javascript
const { attachToAgent } = useFiles()

// При создании или инициализации агента
await attachToAgent(agentId)
```

После привязки агент будет иметь доступ к файлам из хранилища.

## Безопасность

- Все запросы аутентифицируются через Supabase session token
- Каждый пользователь имеет свое персональное хранилище
- Файлы изолированы между пользователями

## Планы развития

- [ ] Поддержка drag & drop для загрузки файлов
- [ ] Предпросмотр файлов (изображения, PDF)
- [ ] Массовое удаление файлов
- [ ] Папки для организации файлов
- [ ] Поиск по файлам
- [ ] Фильтрация по типу файлов
- [ ] Сортировка (по имени, размеру, дате)
- [ ] Автоматическая привязка к активному агенту
- [ ] Статистика использования хранилища

## Связанные файлы

- `src/components/FileManager.vue` - UI компонент
- `src/composables/useFiles.js` - Логика работы с файлами
- `src/api/files.js` - API клиент
- `src/api/client.js` - HTTP клиент с поддержкой FormData
- `src/components/ChatInput.vue` - Интеграция в интерфейс чата

## История изменений

### v1.0.0 (2024-10-10)

- ✨ Первая версия File Manager
- ✨ Поддержка загрузки файлов через Letta API
- ✨ Просмотр списка загруженных файлов
- ✨ Удаление файлов
- ✨ Автоматическое создание персонального хранилища
- ✨ Интеграция в ChatInput
- ✨ Привязка файлов к агенту

