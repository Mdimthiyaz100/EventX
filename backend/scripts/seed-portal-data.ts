import "dotenv/config";
import { prisma } from "../src/config/database.js";
import { MovieStatus, EventStatus } from "@prisma/client";

async function seedContent() {
  const admin = await prisma.user.findFirst();
  if (!admin) {
    console.error("No user found to assign events to!");
    process.exit(1);
  }

  console.log(`Using admin user: ${admin.email} (${admin.id})`);

  // 1. Seed Movies
  const sampleMovies = [
    {
      title: "Ramayana: The Legend",
      slug: "ramayana-the-legend",
      description: "An epic cinematic mythological retelling following the journey of Lord Rama and his triumph against darkness.",
      language: "Hindi",
      genre: "Action, Drama, Mythology",
      duration: 175,
      certification: "UA",
      releaseDate: new Date("2026-12-25"),
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      director: "Nitesh Tiwari",
      cast: "Ranbir Kapoor, Sai Pallavi, Yash, Sunny Deol",
      status: MovieStatus.PUBLISHED,
      featured: true,
    },
    {
      title: "Interstellar Odyssey",
      slug: "interstellar-odyssey",
      description: "A team of deep-space explorers embark on an interstellar journey through a newly detected wormhole in search of humanity's future home.",
      language: "English",
      genre: "Sci-Fi, Adventure",
      duration: 165,
      certification: "U",
      releaseDate: new Date("2026-11-28"),
      posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      director: "Christopher Nolan",
      cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
      status: MovieStatus.PUBLISHED,
      featured: true,
    },
    {
      title: "Cyberpunk 2099",
      slug: "cyberpunk-2099",
      description: "In neon-drenched Neo-Tokyo, a rogue detective uncovers a syndicate controlling neural brain implants.",
      language: "English",
      genre: "Action, Sci-Fi, Thriller",
      duration: 142,
      certification: "A",
      releaseDate: new Date("2026-12-10"),
      posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80",
      trailerUrl: "",
      director: "Denis Villeneuve",
      cast: "Ryan Gosling, Ana de Armas, Harrison Ford",
      status: MovieStatus.PUBLISHED,
      featured: false,
    },
    {
      title: "Kantara: Chapter 1",
      slug: "kantara-chapter-1",
      description: "The divine lore and ferocious battle for ancient tribal forest lands between mortals, kings, and guardian deities.",
      language: "Kannada",
      genre: "Action, Folklore, Thriller",
      duration: 155,
      certification: "UA",
      releaseDate: new Date("2026-10-15"),
      posterUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
      trailerUrl: "",
      director: "Rishab Shetty",
      cast: "Rishab Shetty, Jayaram, Rukmini Vasanth",
      status: MovieStatus.PUBLISHED,
      featured: true,
    }
  ];

  for (const m of sampleMovies) {
    const existing = await prisma.movie.findUnique({ where: { slug: m.slug } });
    if (!existing) {
      await prisma.movie.create({ data: m });
      console.log(`✓ Seeded Movie: ${m.title}`);
    }
  }

  // 2. Seed Events matching the Reference Screenshot & categories:
  // Featured, Comedy Shows, Concerts, Theatre, Events, Sports, Workshops
  const sampleEvents = [
    {
      title: "Stand-Up Comedy Night with Biswa",
      description: "Biswa Kalyan Rath brings his sharp, hilarious observational humor live with a brand new hour of unseen comedy material.",
      category: "Comedy Shows",
      city: "Chennai",
      venue: "Music Academy, TTK Road, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-11-25T19:00:00Z"),
      endAt: new Date("2026-11-25T21:30:00Z"),
      status: EventStatus.PUBLISHED,
      featured: true,
      ticketTypes: [
        { name: "Standard Seating", price: 499, capacity: 400 },
        { name: "Premium Front Row", price: 999, capacity: 150 }
      ]
    },
    {
      title: "Chennai Food Festival 2026",
      description: "Over 100+ stalls showcasing authentic street foods, masterclasses by celebrity chefs, live acoustic music, and gourmet pop-ups.",
      category: "Events",
      city: "Chennai",
      venue: "YMCA Grounds, Nandanam, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-11-28T11:00:00Z"),
      endAt: new Date("2026-11-30T22:00:00Z"),
      status: EventStatus.PUBLISHED,
      featured: true,
      ticketTypes: [
        { name: "General Admission", price: 0, capacity: 5000 },
        { name: "Tasting Pass", price: 350, capacity: 1200 }
      ]
    },
    {
      title: "Anirudh Live in Concert",
      description: "The Rockstar Anirudh Ravichander brings electrifying stadium anthems, pyro visuals, and high-energy guest performances to Chennai.",
      category: "Concerts",
      city: "Chennai",
      venue: "Nehru Indoor Stadium, Periamet, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-12-10T18:30:00Z"),
      endAt: new Date("2026-12-10T23:00:00Z"),
      status: EventStatus.PUBLISHED,
      featured: true,
      ticketTypes: [
        { name: "Silver Standing", price: 1999, capacity: 3500 },
        { name: "Gold Seating", price: 3999, capacity: 1800 },
        { name: "Fan Pit VIP", price: 7999, capacity: 500 }
      ]
    },
    {
      title: "Oru Nadaga Payanam (Tamil Play)",
      description: "An acclaimed, moving theatrical drama portraying human connections, classic literature, and heritage set in Madras.",
      category: "Theatre",
      city: "Chennai",
      venue: "Alliance Française of Madras, College Road, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-11-27T19:00:00Z"),
      endAt: new Date("2026-11-27T21:00:00Z"),
      status: EventStatus.PUBLISHED,
      featured: true,
      ticketTypes: [
        { name: "Balcony", price: 299, capacity: 200 },
        { name: "Orchestra Stall", price: 599, capacity: 180 }
      ]
    },
    // Comedy Shows row
    {
      title: "Aravind SA - Live Solo",
      description: "Aravind SA returns with hilarious takes on culture, city quirks, and life after thirty in his raw, candid standup special.",
      category: "Comedy Shows",
      city: "Chennai",
      venue: "Sir Mutha Venkatasubba Rao Concert Hall, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-12-05T19:30:00Z"),
      endAt: new Date("2026-12-05T21:30:00Z"),
      status: EventStatus.PUBLISHED,
      featured: false,
      ticketTypes: [
        { name: "General Admission", price: 699, capacity: 600 },
        { name: "VIP", price: 1299, capacity: 150 }
      ]
    },
    {
      title: "Rahul Dua - New Material Tour",
      description: "Catch Rahul Dua testing fresh jokes and wild punchlines about relationships, marriage, and family drama.",
      category: "Comedy Shows",
      city: "Chennai",
      venue: "Phoenix Marketcity Courtyard, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-12-14T20:00:00Z"),
      endAt: new Date("2026-12-14T22:00:00Z"),
      status: EventStatus.PUBLISHED,
      featured: false,
      ticketTypes: [
        { name: "Standard", price: 599, capacity: 450 },
        { name: "Front Tier", price: 1099, capacity: 100 }
      ]
    },
    {
      title: "Random Vibes Comedy Night",
      description: "Four of the funniest upcoming regional comics in one curated late-night gig. Unfiltered, fast-paced laughter.",
      category: "Comedy Shows",
      city: "Chennai",
      venue: "Medai - The Stage, Alwarpet, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-11-29T20:30:00Z"),
      endAt: new Date("2026-11-29T22:30:00Z"),
      status: EventStatus.PUBLISHED,
      featured: false,
      ticketTypes: [
        { name: "Entry Pass", price: 349, capacity: 120 }
      ]
    },
    {
      title: "Tamil Stand-up Open Mic",
      description: "Chennai's favorite open mic night! Witness fresh jokes being tested live by established pros and bold debutants.",
      category: "Comedy Shows",
      city: "Chennai",
      venue: "IDAM - The Art & Cultural Space, Kodambakkam, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-12-02T19:00:00Z"),
      endAt: new Date("2026-12-02T21:00:00Z"),
      status: EventStatus.PUBLISHED,
      featured: false,
      ticketTypes: [
        { name: "Audience Ticket", price: 199, capacity: 90 }
      ]
    },
    // Sports & Workshops
    {
      title: "Chennai Marathon 2026",
      description: "Run along the iconic Marina beach sunrise route. Includes chip timing, medal, breakfast, and race kit.",
      category: "Sports",
      city: "Chennai",
      venue: "Napier Bridge to Marina Beach, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2027-01-08T05:00:00Z"),
      endAt: new Date("2027-01-08T10:00:00Z"),
      status: EventStatus.PUBLISHED,
      featured: false,
      ticketTypes: [
        { name: "10K Run", price: 850, capacity: 3000 },
        { name: "Half Marathon (21K)", price: 1200, capacity: 2000 }
      ]
    },
    {
      title: "Pottery & Clay Sculpting Masterclass",
      description: "Hands-on pottery workshop led by master ceramicists. Take home your own hand-thrown clay mugs and plates.",
      category: "Workshops",
      city: "Chennai",
      venue: "DakshinaChitra Heritage Museum, ECR, Chennai",
      imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
      startAt: new Date("2026-12-06T10:30:00Z"),
      endAt: new Date("2026-12-06T14:30:00Z"),
      status: EventStatus.PUBLISHED,
      featured: false,
      ticketTypes: [
        { name: "Workshop Seat (All materials incl.)", price: 1450, capacity: 25 }
      ]
    }
  ];

  for (const e of sampleEvents) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (!existing) {
      await prisma.event.create({
        data: {
          title: e.title,
          description: e.description,
          category: e.category,
          city: e.city,
          venue: e.venue,
          imageUrl: e.imageUrl,
          startAt: e.startAt,
          endAt: e.endAt,
          status: e.status,
          featured: e.featured,
          organizerId: admin.id,
          ticketTypes: {
            create: e.ticketTypes
          }
        }
      });
      console.log(`✓ Seeded Event: ${e.title} (${e.category})`);
    }
  }

  console.log("Seeding finished successfully!");
}

seedContent()
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
