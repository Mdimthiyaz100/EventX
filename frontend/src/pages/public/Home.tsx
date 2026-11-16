import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Check,
  Instagram,
  Linkedin,
  MapPin,
  Music2,
  Ticket,
  Trophy,
  Utensils,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import InlineAlert from "../../components/common/InlineAlert";
import Modal from "../../components/common/Modal";
import { EventCardSkeleton } from "../../components/common/Loader";
import CategoryCard, {
  type CategoryItem,
} from "../../components/customer/CategoryCard";
import EventCard from "../../components/customer/EventCard";
import EventSearch from "../../components/customer/EventSearch";
import type {
  EventCategory,
  EventSearchCriteria,
  EventSummary,
} from "../../types/event";
import { demoEvents, getFeaturedEvents } from "../../services/event.service";

const categories: CategoryItem[] = [
  {
    name: "Music",
    subtitle: "Concerts · Gigs · Albums",
    imageUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Tech",
    subtitle: "Conferences · Workshops",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Food",
    subtitle: "Food · Culture · Pop-ups",
    imageUrl:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sports",
    subtitle: "Matches · Tournaments",
    imageUrl:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80",
  },
];

const initialSearch: EventSearchCriteria = {
  query: "",
  city: "",
  date: "",
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export default function Home() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingDemo, setShowingDemo] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState<EventSearchCriteria>(initialSearch);
  const [activeCategory, setActiveCategory] = useState<EventCategory | null>(
    null,
  );
  const [eventPage, setEventPage] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      try {
        const data = await getFeaturedEvents(controller.signal);
        setEvents(data);
        setShowingDemo(false);
        setApiError(null);
      } catch (error) {
        if (isAbortError(error)) return;
        const reason =
          error instanceof Error ? error.message : "The request could not be completed.";
        setEvents(demoEvents);
        setShowingDemo(true);
        setApiError(reason);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadEvents();
    return () => controller.abort();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.query.trim().toLocaleLowerCase();
    return events.filter((event) => {
      const matchesQuery =
        !query ||
        `${event.title} ${event.category} ${event.location}`
          .toLocaleLowerCase()
          .includes(query);
      const matchesCity =
        !search.city || event.location.toLocaleLowerCase() === search.city.toLocaleLowerCase();
      const eventDate = new Date(event.startDate);
      const matchesDate =
        !search.date ||
        (!Number.isNaN(eventDate.getTime()) &&
          eventDate.toISOString().slice(0, 10) === search.date);
      const matchesCategory =
        !activeCategory || event.category === activeCategory;

      return matchesQuery && matchesCity && matchesDate && matchesCategory;
    });
  }, [activeCategory, events, search]);
  const pageCount = Math.ceil(filteredEvents.length / 4);
  const visibleEvents = filteredEvents.slice(eventPage * 4, eventPage * 4 + 4);

  const scrollToEvents = useCallback(() => {
    document.getElementById("featured-events")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  function chooseCategory(category: EventCategory) {
    setActiveCategory((current) => (current === category ? null : category));
    scrollToEvents();
  }

  function clearSearch() {
    setSearch(initialSearch);
    setActiveCategory(null);
    setEventPage(0);
  }

  function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedNotice(true);
  }

  return (
    <>
      <main id="main-content">
        <section
          aria-labelledby="hero-title"
          className="hero-section relative flex min-h-[610px] items-center overflow-hidden bg-ink sm:min-h-[650px]"
          id="home"
        >
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-[58%_center]"
            fetchPriority="high"
            src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-cream/10 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
          <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-10 pt-16 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[.24em] text-eventx sm:text-sm">
                Make the next one unforgettable
              </p>
              <h1
                className="max-w-3xl font-display text-[clamp(4.5rem,10vw,9.3rem)] font-extrabold uppercase leading-[.76] tracking-[-.055em] text-ink"
                id="hero-title"
              >
                Make room for
                <span className="block text-eventx">the moment.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base font-medium text-ink/80 sm:text-lg">
                Discover experiences worth remembering.
              </p>
            </div>
            <div className="mt-9 max-w-5xl">
              <EventSearch
                onChange={setSearch}
                onSearch={scrollToEvents}
                value={search}
              />
            </div>
          </div>
          <a
            aria-label="Scroll to event categories"
            className="absolute bottom-5 right-6 hidden size-11 items-center justify-center rounded-full border border-white/60 bg-black/10 text-white backdrop-blur transition hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
            href="#categories"
          >
            <ArrowDownRight aria-hidden="true" size={20} />
          </a>
        </section>

        <section
          aria-labelledby="categories-title"
          className="bg-gradient-to-br from-eventx-dark via-eventx to-[#c5121b] py-10 text-white sm:py-12"
          id="categories"
        >
          <div className="mx-auto grid max-w-[1440px] gap-6 px-5 sm:px-8 md:grid-cols-[.8fr_2.2fr] md:items-center lg:gap-10 lg:px-12">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-white/75">
                Find your people
              </p>
              <h2
                className="max-w-xs font-display text-5xl font-extrabold uppercase leading-[.82] tracking-tight sm:text-6xl"
                id="categories-title"
              >
                What’s
                <br />
                happening
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/80">
                Explore events across music, tech, food, sports and more.
              </p>
              <button
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={scrollToEvents}
                type="button"
              >
                Explore all <ArrowRight aria-hidden="true" size={17} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard
                  category={category}
                  key={category.name}
                  onSelect={chooseCategory}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="featured-title"
          className="scroll-mt-20 bg-cream py-14 sm:py-20"
          id="featured-events"
        >
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-[.2em] text-eventx">
                  The good stuff
                </p>
                <h2
                  className="font-display text-5xl font-extrabold uppercase leading-[.84] tracking-tight text-ink sm:text-7xl"
                  id="featured-title"
                >
                  Curated for you
                </h2>
              </div>
              <div className="flex items-center justify-between gap-5 lg:justify-end">
                <p className="max-w-xs text-sm leading-6 text-ink/65">
                  Handpicked events happening near you. Book your tickets and be
                  part of something special.
                </p>
                {activeCategory && (
                  <button
                    className="flex shrink-0 items-center gap-1 rounded-full border border-ink/15 px-3 py-2 text-xs font-bold hover:border-eventx hover:text-eventx focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventx"
                    onClick={() => setActiveCategory(null)}
                    type="button"
                  >
                    {activeCategory}
                    <X aria-hidden="true" size={14} />
                  </button>
                )}
              </div>
            </div>

            {showingDemo && apiError && (
              <div className="mb-5">
                <InlineAlert
                  message={`Live events could not be loaded (${apiError}). Showing sample events instead.`}
                  onDismiss={() => setApiError(null)}
                />
              </div>
            )}

            <div
              aria-busy={loading}
              aria-live="polite"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
            >
              {loading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <EventCardSkeleton key={index} />
                ))
              ) : filteredEvents.length > 0 ? (
                visibleEvents.map((event) => (
                  <EventCard
                    event={event}
                    key={event.id}
                    onBook={setSelectedEvent}
                  />
                ))
              ) : (
                <EmptyState
                  description="Try a different city, date, or search term to find your next great experience."
                  onClear={clearSearch}
                  title="No events found"
                />
              )}
            </div>
            {!loading && pageCount > 1 && (
              <div className="mt-7 flex items-center justify-center gap-3">
                <button
                  aria-label="Previous featured events"
                  className="grid size-10 place-items-center rounded-full border border-ink/20 text-ink transition hover:border-eventx hover:text-eventx disabled:opacity-40"
                  disabled={eventPage === 0}
                  onClick={() => setEventPage((page) => page - 1)}
                  type="button"
                >
                  <ArrowRight aria-hidden="true" className="rotate-180" size={17} />
                </button>
                <span className="text-xs font-semibold text-ink/60">
                  {eventPage + 1} / {pageCount}
                </span>
                <button
                  aria-label="Next featured events"
                  className="grid size-10 place-items-center rounded-full bg-eventx text-white transition hover:bg-eventx-dark disabled:opacity-40"
                  disabled={eventPage >= pageCount - 1}
                  onClick={() => setEventPage((page) => page + 1)}
                  type="button"
                >
                  <ArrowRight aria-hidden="true" size={17} />
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          aria-labelledby="organizer-title"
          className="organizer-section relative overflow-hidden bg-ink text-white"
          id="for-organizers"
        >
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-center opacity-55"
            loading="lazy"
            src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2000&q=85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/15" />
          <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.3fr_.7fr] lg:px-12">
            <div className="max-w-xl">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[.22em] text-white/75">
                For organizers
              </p>
              <h2
                className="font-display text-6xl font-extrabold uppercase leading-[.8] tracking-tight sm:text-8xl"
                id="organizer-title"
              >
                Your next
                <br />
                great story
                <br />
                <span className="text-eventx">starts here.</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/75 sm:text-base">
                Create, manage and grow your events with a powerful platform
                built for organizers.
              </p>
              <a
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-eventx px-5 py-3 text-sm font-bold text-white transition hover:bg-eventx-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                href="mailto:organizers@eventx.com?subject=Become%20an%20EventX%20organizer"
              >
                Become an organizer
                <ArrowRight aria-hidden="true" size={16} />
              </a>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/75">
                <li className="flex items-center gap-2">
                  <Check aria-hidden="true" className="text-eventx" size={15} />
                  Simple event setup
                </li>
                <li className="flex items-center gap-2">
                  <Check aria-hidden="true" className="text-eventx" size={15} />
                  Real-time insights
                </li>
              </ul>
            </div>
            <div aria-hidden="true" className="organizer-phone-wrap hidden lg:flex">
              <div className="organizer-phone">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span>9:41</span>
                  <span className="h-4 w-16 rounded-full bg-black" />
                  <span>•••</span>
                </div>
                <div className="mt-4 border-b border-ink/10 pb-3 font-display text-lg font-extrabold">
                  Event<span className="text-eventx">X</span>
                </div>
                <div className="relative mt-3 overflow-hidden rounded-xl bg-ink">
                  <img
                    alt=""
                    className="h-44 w-full object-cover opacity-70"
                    src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 p-3 text-white">
                    <span className="font-display text-2xl font-extrabold uppercase leading-[.86]">
                      Make room for
                      <span className="block text-eventx">the moment.</span>
                    </span>
                    <span className="mt-2 text-[9px] text-white/80">
                      Discover experiences worth remembering.
                    </span>
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-cream px-3 py-2 text-[9px] text-ink/70">
                  ◯ Search events, city or date
                </div>
                <div className="mt-2 rounded-lg bg-eventx px-3 py-2 text-center text-[9px] font-bold text-white">
                  Explore events →
                </div>
                <div className="mt-4 font-display text-lg font-bold uppercase">
                  What’s happening
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {[Music2, CalendarDays, Utensils, Trophy].map((Icon, index) => (
                    <span
                      className="grid aspect-square place-items-center rounded-lg bg-cream text-eventx"
                      key={index}
                    >
                      <Icon size={16} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-paper" id="account">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1.2fr] lg:px-12">
          <div>
            <a
              className="font-display text-3xl font-extrabold tracking-tight text-ink"
              href="/#home"
            >
              Event<span className="text-eventx">X</span>
            </a>
            <p className="mt-1 text-xs text-ink/60">Discover · Book · Experience</p>
            <div className="mt-5 flex gap-2.5">
              {[Instagram, Linkedin, Music2].map((Icon, index) => (
                <a
                  aria-label={["Instagram", "LinkedIn", "Social media"][index]}
                  className="grid size-8 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:border-eventx hover:text-eventx focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventx"
                  href="mailto:hello@eventx.com"
                  key={index}
                >
                  <Icon aria-hidden="true" size={15} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-extrabold">Explore</h2>
            <ul className="mt-3 space-y-2 text-xs text-ink/65">
              <li><a className="hover:text-eventx" href="/#featured-events">Discover events</a></li>
              <li><a className="hover:text-eventx" href="/#categories">Events</a></li>
              <li><a className="hover:text-eventx" href="/#categories">Categories</a></li>
              <li><a className="hover:text-eventx" href="/#categories">Cities</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-extrabold">For organizers</h2>
            <ul className="mt-3 space-y-2 text-xs text-ink/65">
              <li><a className="hover:text-eventx" href="#for-organizers">Create event</a></li>
              <li><a className="hover:text-eventx" href="#for-organizers">Organizer guide</a></li>
              <li><a className="hover:text-eventx" href="#for-organizers">Pricing</a></li>
              <li><a className="hover:text-eventx" href="mailto:organizers@eventx.com">Resources</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-extrabold">Stay in the loop</h2>
            <p className="mt-2 text-xs leading-5 text-ink/65">
              Get updates on new events and exclusive deals around you.
            </p>
            <form className="mt-3 flex gap-2" onSubmit={subscribe}>
              <label className="sr-only" htmlFor="newsletter-email">Your email</label>
              <input
                className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs outline-none focus:border-eventx focus:ring-2 focus:ring-eventx/15"
                id="newsletter-email"
                name="email"
                placeholder="Enter your email"
                required
                type="email"
              />
              <Button
                aria-label="Subscribe to the newsletter"
                className="min-h-9 rounded-lg px-3 py-2"
                type="submit"
              >
                {savedNotice ? <Check size={16} /> : <ArrowRight size={16} />}
              </Button>
            </form>
            {savedNotice && (
              <p className="mt-2 text-xs text-emerald-800" role="status">
                Thanks for your interest. Newsletter sign-up is coming soon.
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-ink/10">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-4 text-[10px] text-ink/55 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <span>© 2026 EventX. All rights reserved.</span>
            <span>Customer and organizer accounts are coming soon.</span>
          </div>
        </div>
      </footer>

      {selectedEvent && (
        <Modal onClose={() => setSelectedEvent(null)} title="Event details">
          <img
            alt={selectedEvent.title}
            className="mb-5 h-52 w-full rounded-xl object-cover"
            src={selectedEvent.imageUrl}
          />
          <p className="font-display text-3xl font-bold uppercase">
            {selectedEvent.title}
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink/70">
            <MapPin aria-hidden="true" size={16} />
            {selectedEvent.location}
            <span aria-hidden="true">·</span>
            <CalendarDays aria-hidden="true" size={16} />
            {new Intl.DateTimeFormat("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(selectedEvent.startDate))}
          </p>
          <p className="mt-4 text-sm leading-6 text-ink/70">
            {selectedEvent.description}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-5">
            <span className="text-sm text-ink/60">
              Tickets from{" "}
              <strong className="text-base text-ink">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(selectedEvent.price)}
              </strong>
            </span>
            <Button onClick={() => setSelectedEvent(null)}>
              Keep exploring <Ticket aria-hidden="true" size={16} />
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}