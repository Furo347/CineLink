import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function MovieRow({
                                     movie,
                                     subtitle,
                                     right,
                                 }: {
    movie: {
        tmdbId: number;
        title: string;
        poster: string | null;
        release_date?: string;
        vote_average?: number;
    };
    subtitle?: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Link to={`/app/movies/${movie.tmdbId}`} className="shrink-0">
                <div className="h-16 w-12 overflow-hidden rounded-xl bg-white/10">
                    {movie.poster ? (
                        <img src={movie.poster} alt="" className="h-full w-full object-cover" />
                    ) : null}
                </div>
            </Link>

            <div className="min-w-0 flex-1">
                <Link
                    to={`/app/movies/${movie.tmdbId}`}
                    className="font-semibold text-textPrimary hover:underline underline-offset-4 truncate block"
                >
                    {movie.title}
                </Link>

                <div className="mt-2 flex flex-wrap gap-2 items-center">
                    {movie.release_date ? <Badge>{movie.release_date.slice(0, 4)}</Badge> : null}
                    {typeof movie.vote_average === "number" ? (
                        <Badge>⭐ {movie.vote_average.toFixed(1)}</Badge>
                    ) : null}
                </div>

                {subtitle ? <div className="mt-2 text-sm text-textSecondary">{subtitle}</div> : null}
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
        </div>
    );
}
