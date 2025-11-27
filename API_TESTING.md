# API Testing Guide

## Запуск сервера

```bash
cd server
npm run dev
```

Сервер запустится на `http://localhost:3000`

## Тестирование эндпоинтов

### Projects API

#### GET /api/projects

**Запрос:**

```bash
curl http://localhost:3000/api/projects
```

**Ответ (200 OK):**

```json
[
  {
    "id": "1",
    "title": {
      "ru": "E-Commerce Платформа",
      "en": "E-Commerce Platform"
    },
    "description": {
      "ru": "...",
      "en": "..."
    },
    "techStack": ["React", "TypeScript"],
    "year": 2024,
    "status": "Completed"
  }
]
```

#### POST /api/projects

**Запрос:**

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": {"ru": "Test", "en": "Test"},
    "description": {"ru": "Test", "en": "Test"},
    "techStack": ["React"],
    "year": 2024,
    "status": "In Progress"
  }'
```

**Ответ (201 Created):**

```json
{
  "id": "1734567890123",
  "title": { "ru": "Test", "en": "Test" },
  "description": { "ru": "Test", "en": "Test" },
  "techStack": ["React"],
  "year": 2024,
  "status": "In Progress"
}
```

#### PATCH /api/projects/:id

**Запрос:**

```bash
curl -X PATCH http://localhost:3000/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

**Ответ (200 OK):**

```json
{
  "id": "1",
  "title": {...},
  "status": "Completed",
  ...
}
```

#### DELETE /api/projects/:id

**Запрос:**

```bash
curl -X DELETE http://localhost:3000/api/projects/1
```

**Ответ (204 No Content):**
(пустое тело)

**Ошибка (404 Not Found):**

```json
{
  "error": "Project not found"
}
```

### Profile API

#### GET /api/profile

**Запрос:**

```bash
curl http://localhost:3000/api/profile
```

**Ответ (200 OK):**

```json
{
  "name": "John Doe",
  "role": {
    "ru": "Full Stack Разработчик",
    "en": "Full Stack Developer"
  },
  "description": {
    "ru": "...",
    "en": "..."
  },
  "aboutTexts": {
    "ru": ["..."],
    "en": ["..."]
  },
  "socials": {
    "github": "",
    "linkedin": "",
    "telegram": ""
  }
}
```

#### PATCH /api/profile

**Запрос:**

```bash
curl -X PATCH http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "socials": {
      "github": "https://github.com/username"
    }
  }'
```

**Ответ (200 OK):**

```json
{
  "name": "Updated Name",
  "role": {...},
  "socials": {
    "github": "https://github.com/username",
    ...
  }
}
```

### Skills API

#### GET /api/skills

**Запрос:**

```bash
curl http://localhost:3000/api/skills
```

**Ответ (200 OK):**

```json
["React", "TypeScript", "JavaScript", ...]
```

#### POST /api/skills

**Запрос:**

```bash
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Skill",
    "category": "other",
    "level": "middle"
  }'
```

**Ответ (201 Created):**

```json
{
  "id": "skill-26",
  "name": "New Skill",
  "category": "other",
  "level": "middle"
}
```

**Ошибка (400 Bad Request):**

```json
{
  "error": "Skill already exists"
}
```

#### PATCH /api/skills/:id

**Запрос:**

```bash
curl -X PATCH http://localhost:3000/api/skills/skill-1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Skill",
    "category": "frontend",
    "level": "advanced"
  }'
```

**Ответ (200 OK):**

```json
{
  "id": "skill-1",
  "name": "Updated Skill",
  "category": "frontend",
  "level": "advanced"
}
```

#### DELETE /api/skills/:id

**Запрос:**

```bash
curl -X DELETE http://localhost:3000/api/skills/skill-1
```

**Ответ (204 No Content):**
(пустое тело)

## Автоматическое тестирование

Запустите тестовый скрипт:

```bash
# В одном терминале запустите сервер
npm run dev

# В другом терминале запустите тесты
node test-api.js
```

## Проверка сохранения данных

После выполнения операций создания/обновления/удаления, проверьте файлы:

- `src/data/projects.json` - проекты
- `src/data/profile.json` - профиль
- `src/data/skills.json` - навыки

Изменения должны сохраняться в этих файлах.
