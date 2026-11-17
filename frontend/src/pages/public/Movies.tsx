import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Film } from "lucide-react";
import { listPublishedMovies } from "../../services/movieService";
import MovieCard from "../../components/customer/MovieCard";
import type { MovieItem } from "../../types/content";

export default function PublicMovies() {
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  const query = useQuery({
    queryKey: ["public-movies", search, selectedLanguage, selectedGenre],
    queryFn: () =>
      listPublishedMovies({
        page: 1,
        limit: 50,
        search: search.trim() || undefined,
        language: selectedLanguage || undefined,
        genre: selectedGenre || undefined,
        sort: "desc",
      }),
  });

  const movies = (query.data?.movies || []) as unknown as MovieItem[];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-10">
      {/* Header */}
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#E31824]">
            CINEMA RELEASES
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
            EXPLORE MOVIES
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Now showing in theatres and upcoming blockbusters.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Showing <span className="text-white font-bold">{movies.length}</span> titles
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-[#161224] p-4 shadow-xl">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movie title, director or cast..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#E31824] focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs font-semibold text-white focus:border-[#E31824] focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-[#161224] text-white">All Languages</option>
            <option value="Hindi" className="bg-[#161224] text-white">Hindi</option>
            <option value="English" className="bg-[#161224] text-white">English</option>
            <option value="Tamil" className="bg-[#161224] text-white">Tamil</option>
            <option value="Telugu" className="bg-[#161224] text-white">Telugu</option>
            <option value="Kannada" className="bg-[#161224] text-white">Kannada</option>
            <option value="Malayalam" className="bg-[#161224] text-white">Malayalam</option>
          </select>
        </div>

        <div>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs font-semibold text-white focus:border-[#E31824] focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-[#161224] text-white">All Genres</option>
            <option value="Action" className="bg-[#161224] text-white">Action</option>
            <option value="Drama" className="bg-[#161224] text-white">Drama</option>
            <option value="Sci-Fi" className="bg-[#161224] text-white">Sci-Fi</option>
            <option value="Thriller" className="bg-[#161224] text-white">Thriller</option>
            <option value="Comedy" className="bg-[#161224] text-white">Comedy</option>
            <option value="Romance" className="bg-[#161224] text-white">Romance</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {query.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#161224] p-16 text-center">
          <Film size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="font-display text-2xl font-bold uppercase text-white">
            No Movies Found
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Try adjusting your search query or language filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
