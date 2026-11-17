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

## Admin movie catalog

The admin movie catalog uses the additive `Movie` migration and server-side
Cloudinary uploads. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET` in the private `.env` to enable image uploads. The
application validates image content and size before sending images to
`eventx/movies/posters` or `eventx/movies/banners`; only secure URLs are stored
in MySQL. These settings can remain empty when Cloudinary uploads are not in use.

After reviewing the new additive migration, deploy it with `npm run db:deploy`.
This applies pending migration SQL and does not reset the database. Do not use
`prisma migrate reset` against the Aiven database.

Admin movie endpoints are mounted at `/api/admin/movies` and require an access
token for an account with the `ADMIN` role. Published-only catalog endpoints
are available at `/api/movies` and `/api/movies/:slug`. The admin interface is
served by the frontend at `/admin`; published titles are listed at `/movies`.
