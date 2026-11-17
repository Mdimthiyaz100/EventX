# EventX database schema

The Prisma schema is the canonical model definition at `backend/prisma/schema.prisma`.
This project uses MySQL through the `mysql` Prisma provider.

## Movie catalog

The additive `Movie` model is independent of the existing `User`, `Event`,
`Booking`, `Payment`, and `Ticket` models. It stores movie metadata and
Cloudinary secure image URLs; image bytes are not stored in MySQL.

| Field | Purpose |
| --- | --- |
| `id` | Prisma generated cuid identifier |
| `title`, `slug` | Display title and unique public URL segment |
| `description`, `language`, `genre`, `duration` | Catalog content and screening metadata |
| `certification`, `releaseDate` | Audience rating and release date |
| `posterUrl`, `bannerUrl`, `trailerUrl` | Remote media links |
| `director`, `cast` | Credits |
| `status` | `DRAFT`, `PUBLISHED`, or `ARCHIVED` visibility state |
| `featured` | Catalog highlight flag |
| `createdAt`, `updatedAt` | Record timestamps |

Indexes support public status/date ordering, language and genre filters, and
featured listings. The migration is `backend/prisma/migrations/20261116120000_add_movies`.
