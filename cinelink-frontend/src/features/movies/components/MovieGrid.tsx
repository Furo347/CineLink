import type { Movie } from "../movies.types";
import MovieCard from "./MovieCard";

export default function MovieGrid({ movies }: { movies: Movie[] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {movies.map((m) => (
                <MovieCard key={String(m.tmdbId)} movie={m} />
            ))}
        </div>
    );
}
