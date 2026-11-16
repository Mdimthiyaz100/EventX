# EventX backend

TypeScript REST API using Express, Prisma, and MySQL. See
[`../docs/API_DOCUMENTATION.md`](../docs/API_DOCUMENTATION.md) for setup,
endpoint access rules, payment configuration, and the response contract.

Use Node.js 20 or newer. Copy `.env.example` to `.env`, configure the database
and distinct JWT secrets, then run:

```powershell
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

`npm run build` generates the Prisma client and type-checks/compiles the API.
Swagger UI is served at `/api/docs`.

The first `npm run dev` creates `.env` from the example if needed and reports
which required settings still need values. Razorpay settings are optional for
API startup, but both API credentials and the webhook secret must be configured
before enabling payment workflows.

To provision the first admin, set `BOOTSTRAP_ADMIN_EMAIL` and
`BOOTSTRAP_ADMIN_PASSWORD` (at least 12 characters) only in a trusted
environment and run `npm run db:seed` once. The seed refuses to change an
existing account and credentials should be removed after bootstrap.
