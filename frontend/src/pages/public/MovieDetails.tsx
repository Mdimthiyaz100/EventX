import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Play,
  Heart,
  Film,
  MapPin,
  ChevronRight,
  Ticket,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getPublishedMovie } from "../../services/movieService";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

interface Cinema {
  id: string;
  name: string;
  location: string;
  screenType: string;
  rating: number;
  showtimes: string[];
}

export default function MovieDetails() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  // Booking Flow State
  const [selectedDate, setSelectedDate] = useState("Today, 21 Nov");
  const [selectedCinemaId, setSelectedCinemaId] = useState("cin-1");
  const [selectedShowtime, setSelectedShowtime] = useState("6:30 PM");

  const query = useQuery({
    queryKey: ["public-movie", slug],
    queryFn: () => getPublishedMovie(slug),
  });

  const movie = query.data;

  const cinemas: Cinema[] = [
    {
      id: "cin-1",
      name: "PVR Luxe - Phoenix Marketcity",
      location: "Velachery, Chennai (2.4 km)",
      screenType: "IMAX 2D • Dolby Atmos",
      rating: 4.6,
      showtimes: ["1:15 PM", "4:30 PM", "6:30 PM", "9:45 PM"],
    },
    {
      id: "cin-2",
      name: "INOX Megaplex - Marina Mall",
      location: "OMR, Chennai (5.1 km)",
      screenType: "Laser 2D • Dolby 7.1",
      rating: 4.4,
      showtimes: ["2:00 PM", "5:15 PM", "8:30 PM", "11:15 PM"],
    },
    {
      id: "cin-3",
      name: "AGS Cinemas - OMR",
      location: "Navalur, Chennai (7.2 km)",
      screenType: "4K RGB Laser",
      rating: 4.3,
      showtimes: ["3:00 PM", "6:45 PM", "10:00 PM"],
    },
  ];

  if (query.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#000000] text-white">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ED1C24]" />
      </div>
    );
  }

  if (query.isError || !movie) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center bg-[#000000] text-white">
        <Film size={44} className="mx-auto text-[#ED1C24] mb-3" />
        <h2 className="font-display text-3xl font-black uppercase text-white">Movie Unavailable</h2>
        <p className="mt-2 text-sm text-[#777777]">This title is currently not published or has ended its run.</p>
        <Link
          to="/movies"
          className="mt-6 inline-block rounded-xl bg-[#ED1C24] px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-[#FF3038]"
        >
          &larr; Browse Movies
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(movie.id);

  const handleProceedToSeats = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const chosenCinema = cinemas.find((c) => c.id === selectedCinemaId);
    navigate(
      `/events/movie-${movie.slug}/seats?tier=IMAX&qty=2&showtime=${encodeURIComponent(
        selectedShowtime
      )}&cinema=${encodeURIComponent(chosenCinema?.name || "PVR Luxe")}`
    );
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative min-h-[480px] overflow-hidden bg-[#0A0A0A] sm:min-h-[580px] border-b border-[#292929]">
        {movie.bannerUrl && (
          <img
            src={movie.bannerUrl}
            alt={movie.title}
            className="absolute inset-0 size-full object-cover opacity-30 filter brightness-75 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />

        <div className="relative mx-auto flex min-h-[480px] max-w-[1440px] items-end gap-8 px-5 py-12 sm:min-h-[580px] sm:px-8 lg:px-12">
          {/* Movie Poster */}
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="hidden w-52 rounded-2xl border border-[#292929] shadow-2xl sm:block lg:w-64 shrink-0"
          />

          <div className="max-w-2xl">
            <Link
              to="/movies"
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#777777] hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>All Movies</span>
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <span className="rounded-md bg-[#ED1C24] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                {movie.genre}
              </span>
              <span className="rounded-md border border-[#292929] bg-[#111111] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#BDBDBD]">
                {movie.certification}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
              {movie.title}
            </h1>

            <p className="mt-3 text-xs sm:text-sm font-semibold text-[#BDBDBD]">
              {movie.language} · {Math.floor(movie.duration / 60)}h {movie.duration % 60}m duration
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#777777]">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-[#ED1C24]" />
                <span>
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(movie.releaseDate))}
                </span>
              </span>
              <span>Directed by {movie.director}</span>
            </div>

            {/* ACTION BUTTONS: PROMINENT BOOK NOW BUTTON */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById("booking-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ED1C24] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 hover:bg-[#FF3038] hover:scale-105 transition"
              >
                <Ticket size={16} />
                <span>Book Tickets</span>
              </button>

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:border-[#ED1C24] hover:bg-[#171717] transition"
                >
                  <Play size={14} fill="currentColor" className="text-[#ED1C24]" />
                  <span>Watch Trailer</span>
                </a>
              )}

              <button
                onClick={() => toggleWishlist(movie.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-4 py-3.5 text-xs font-bold text-[#BDBDBD] hover:text-white hover:border-[#ED1C24] transition"
              >
                <Heart
                  size={15}
                  className={wishlisted ? "fill-[#ED1C24] text-[#ED1C24]" : ""}
                />
                <span>{wishlisted ? "In Wishlist" : "Save Movie"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CINEMA & SHOWTIME SELECTION SECTION */}
      <section id="booking-section" className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 border-b border-[#292929]">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Select Cinema & Showtimes
            </h2>
            <p className="mt-1 text-xs text-[#777777]">
              Choose your preferred theater, screen format, and showtime in Chennai
            </p>
          </div>

          {/* Date Selector Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 text-xs font-bold">
            {["Today, 21 Nov", "Tomorrow, 22 Nov", "Sat, 23 Nov", "Sun, 24 Nov"].map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 transition ${
                  selectedDate === date
                    ? "border-[#ED1C24] bg-[#ED1C24] text-white"
                    : "border-[#292929] bg-[#111111] text-[#BDBDBD] hover:border-[#777777]"
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* Cinemas List */}
        <div className="space-y-4">
          {cinemas.map((cinema) => {
            const isSelectedCinema = selectedCinemaId === cinema.id;
            return (
              <div
                key={cinema.id}
                className={`rounded-2xl border p-5 transition ${
                  isSelectedCinema
                    ? "border-[#ED1C24] bg-[#111111] shadow-lg shadow-[#ED1C24]/10"
                    : "border-[#292929] bg-[#0A0A0A] hover:border-[#777777]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#292929]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{cinema.name}</h3>
                      <span className="rounded bg-[#ED1C24]/10 px-2 py-0.5 text-[10px] font-bold text-[#ED1C24]">
                        {cinema.screenType}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#777777]">
                      <MapPin size={13} className="text-[#ED1C24]" />
                      {cinema.location}
                    </p>
                  </div>

                  <span className="text-xs text-[#777777]">
                    Cancellation available up to 2 hours before showtime
                  </span>
                </div>

                {/* Showtimes Row */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {cinema.showtimes.map((time) => {
                    const isTimeActive = isSelectedCinema && selectedShowtime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedCinemaId(cinema.id);
                          setSelectedShowtime(time);
                        }}
                        className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                          isTimeActive
                            ? "border-[#ED1C24] bg-[#ED1C24] text-white shadow-md shadow-[#ED1C24]/40"
                            : "border-[#292929] bg-[#171717] text-[#BDBDBD] hover:border-[#777777] hover:text-white"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Movie Booking Summary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between rounded-2xl border border-[#ED1C24]/30 bg-[#111111] p-5 gap-4">
          <div>
            <span className="text-[11px] text-[#777777] uppercase tracking-wider block">Selected Show</span>
            <p className="text-sm font-bold text-white">
              {cinemas.find((c) => c.id === selectedCinemaId)?.name} • {selectedDate} at {selectedShowtime}
            </p>
          </div>
          <button
            onClick={handleProceedToSeats}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#FF3038] shadow-lg shadow-[#ED1C24]/20 transition"
          >
            <span>Select Movie Seats</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      {/* 3. MOVIE DETAILS & CAST */}
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_320px] lg:px-12">
        <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 sm:p-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ED1C24]">
            SYNOPSIS
          </span>
          <h2 className="font-display text-2xl font-bold uppercase text-white mt-1 mb-4">
            The Story
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#BDBDBD]">
            {movie.description}
          </p>
        </div>

        <aside className="rounded-3xl border border-[#292929] bg-[#111111] p-6 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
              Starring Cast
            </span>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#BDBDBD]">
              {movie.cast || "Cast details coming soon."}
            </p>
          </div>

          <div className="border-t border-[#292929] pt-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
              Runtime
            </span>
            <div className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
              <Clock3 size={15} className="text-[#ED1C24]" />
              <span>{movie.duration} Minutes</span>
            </div>
          </div>

          <div className="border-t border-[#292929] pt-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
              Language & Certification
            </span>
            <p className="mt-1 text-sm font-bold text-white">
              {movie.language} ({movie.certification})
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
