# Вход через Google: как включить

Вход через Google работает на собственном сайте UniHop (например, на Firebase Hosting). Внутри Claude он не работает: Claude не даёт странице открывать окно входа Google. Там прогресс сохраняется в аккаунте Claude.

Нужен аккаунт Google. Всё ниже бесплатно в пределах лимитов Firebase (тариф Spark).

## 1. Создать проект Firebase

1. Откройте https://console.firebase.google.com и нажмите **Создать проект** (Create a project). Название, например, `unihop`.
2. Google Analytics можно выключить.

## 2. Включить вход через Google

1. Слева: **Build → Authentication → Get started**.
2. Вкладка **Sign-in method → Google → Enable**.
3. Укажите email поддержки проекта и сохраните.

## 3. Создать базу данных

1. Слева: **Build → Firestore Database → Create database**.
2. Выберите регион ближе к ученикам (например, `europe-west`) и режим **production**.
3. Вкладка **Rules**: замените текст на содержимое файла `firestore.rules` из проекта и нажмите **Publish**. Так каждый ученик видит только свои данные.

## 4. Подключить сайт к проекту

1. Шестерёнка → **Project settings → Your apps →** значок `</>` (Web). Название любое, Firebase Hosting можно отметить.
2. Firebase покажет блок `firebaseConfig`. Скопируйте файл `.env.example` в `.env.local` и перенесите туда четыре значения: `apiKey`, `authDomain`, `projectId`, `appId`.

## 5. Проверить на своём компьютере

```bash
npm run dev
```

Откройте http://localhost:5173, пройдите тест — на странице результата появится «Сохрани свой результат → Войти через Google».

## 6. Выложить сайт

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

```bash
firebase use --add
```

Выберите свой проект.

```bash
npm run build
```

```bash
firebase deploy
```

Firebase покажет адрес сайта вида `https://unihop.web.app`. Он сам попадает в список разрешённых доменов для входа. Если подключите свой домен, добавьте его в **Authentication → Settings → Authorized domains**.

## Что сохраняется

Один документ на ученика: `users/{id}` — ответы теста, план, список вузов, отметки документов, опросы самочувствия, имя и язык. Email и имя берутся из Google. Пароль Google сайт не видит. Файлы документов не загружаются.
