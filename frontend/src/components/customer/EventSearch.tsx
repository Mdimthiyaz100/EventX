import { ArrowRight, CalendarDays, MapPin, Search } from "lucide-react";
import type { FormEvent } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import type { EventSearchCriteria } from "../../types/event";

interface EventSearchProps {
  value: EventSearchCriteria;
  onChange: (value: EventSearchCriteria) => void;
  onSearch: () => void;
}

export default function EventSearch({
  value,
  onChange,
  onSearch,
}: EventSearchProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch();
  }

  return (
    <form
      aria-label="Search events"
      className="event-search grid gap-2 rounded-2xl border border-white/60 bg-paper p-3 shadow-[0_16px_50px_rgba(25,12,8,.22)] sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-end sm:gap-3 sm:p-3.5"
      onSubmit={submit}
    >
      <Input
        autoComplete="off"
        icon={<Search aria-hidden="true" className="shrink-0 text-ink/65" size={18} />}
        label="Search for events"
        name="query"
        onChange={(event) => onChange({ ...value, query: event.target.value })}
        placeholder="Concert, workshop, festival..."
        value={value.query}
      />
      <label className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-[.12em] text-ink/65">
          City
        </span>
        <span className="flex min-h-11 items-center gap-2.5 rounded-lg border border-ink/10 bg-white/70 px-3.5 transition focus-within:border-eventx/70 focus-within:ring-2 focus-within:ring-eventx/10">
          <MapPin aria-hidden="true" className="shrink-0 text-ink/65" size={18} />
          <select
            aria-label="Select city"
            className="w-full cursor-pointer bg-transparent text-sm text-ink outline-none"
            name="city"
            onChange={(event) => onChange({ ...value, city: event.target.value })}
            value={value.city}
          >
            <option value="">All cities</option>
            <option value="Chennai">Chennai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pondicherry">Pondicherry</option>
          </select>
        </span>
      </label>
      <Input
        icon={<CalendarDays aria-hidden="true" className="shrink-0 text-ink/65" size={18} />}
        label="Date"
        name="date"
        onChange={(event) => onChange({ ...value, date: event.target.value })}
        type="date"
        value={value.date}
      />
      <Button className="w-full whitespace-nowrap sm:w-auto" type="submit">
        Explore events
        <ArrowRight aria-hidden="true" size={16} />
      </Button>
    </form>
  );
}