# Currency Converter — Backend

NestJS API that wraps [FreeCurrencyAPI](https://freecurrencyapi.com/docs/) so the API key never
reaches the browser. The React frontend talks only to this service.

## Endpoints

| Method | Path                    | Body                                                   |
| ------ | ----------------------- | ------------------------------------------------------- |
| GET    | `/currency/currencies`  | —                                                         |
| POST   | `/currency/convert`     | `{ "amount": number, "from": string, "to": string }`     |
| POST   | `/currency/historical`  | `{ "amount": number, "from": string, "to": string, "date": "YYYY-MM-DD" }` |

## Environment variables

Copy `.env.example` to `.env` and fill in the API key:

```
PORT=3000
FRONTEND_URL=http://localhost:5173
FREECURRENCY_API_KEY=
```

`.env` is git-ignored — never commit it. Get a free key at https://freecurrencyapi.com/.

## Run

```bash
npm install
npm run start:dev   # watch mode, http://localhost:3000
npm run build        # production build -> dist/
npm run start:prod   # run the built output
npm run lint
```

## Project layout

```
src/
  config/            environment variable loading (ConfigModule)
  currency/
    dto/             request validation (class-validator)
    interfaces/       raw FreeCurrencyAPI response types
    currency.controller.ts
    currency.service.ts   FreeCurrencyAPI client + error mapping
    currency.types.ts     domain types returned to the frontend
  main.ts            CORS, global ValidationPipe, bootstrap
```
