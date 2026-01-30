import { Link } from "react-router-dom";
import type { Movie } from "../movies.types";
import { getMovieId, getPoster } from "../movies.types";
import { Badge } from "@/components/ui/badge";

export default function MovieCard({ movie }: { movie: Movie }) {
    const id = getMovieId(movie);
    const poster = getPoster(movie);

    return (
        <Link
            to={`/app/movies/${id}`}
            className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden">
                {poster ? (
                    <img
                        src={poster}
                        alt={movie.title}
                        className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-white/5 to-white/0 flex items-end p-4">
                        <div className="text-sm text-text-secondary">No poster</div>
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold leading-snug text-text-primary line-clamp-2">
                        {movie.title}
                    </h3>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                    {movie.genres?.slice(0, 2).map((g) => (
                        <Badge key={g}>{g}</Badge>
                    ))}
                    {movie.releaseDate && <Badge>{movie.releaseDate.slice(0, 4)}</Badge>}
                </div>

                {movie.description && (
                    <p className="mt-3 text-sm text-text-secondary line-clamp-2">
                        {movie.description}
                    </p>
                )}
            </div>
        </Link>
    );
}
