import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { forwardRef, useImperativeHandle } from "react";

import RequireAuth from "@/app/RequireAuth";
import MoviesPage from "@/features/movies/pages/MoviesPage";
import MovieDetailsPage from "@/features/movies/pages/MovieDetailsPage";
import FeedPage from "@/features/feed/pages/FeedPage";
import UserProfilePage from "@/features/users/pages/UserProfilePage";
import { moviesApi } from "@/features/movies/movies.api";
import { feedApi } from "@/features/feed/feed.api";
import { usersApi } from "@/features/users/users.api";
import { favoritesApi } from "@/features/favorites/favorites.api";
import { authStorage } from "@/services/auth.storage";
import { toast } from "sonner";
import type { Movie } from "@/features/movies/movies.types";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/features/search/components/SearchSpotlight", () => ({
  default: ({ placeholder }: { placeholder: string }) => (
    <input aria-label="search-spotlight" placeholder={placeholder} />
  ),
}));

vi.mock("@/features/comments/components/CommentsSection", () => ({
  default: forwardRef((_props: { movieId: number }, ref) => {
    useImperativeHandle(ref, () => ({ focus: vi.fn() }));
    return <section>Commentaires mockés</section>;
  }),
}));

vi.mock("@/features/follow/components/FollowButton", () => ({
  default: ({ initialFollowing }: { initialFollowing: boolean }) => (
    <button>{initialFollowing ? "Déjà suivi" : "Suivre"}</button>
  ),
}));

vi.mock("@/features/movies/movies.cache", () => ({
  getMovieMini: vi.fn(async (tmdbId: number) => ({
    tmdbId,
    title: `Film ${tmdbId}`,
    poster: null,
    release_date: "2026-01-01",
    vote_average: 8,
  })),
}));

vi.mock("@/features/movies/movies.api", () => ({
  moviesApi: {
    getPopular: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock("@/features/feed/feed.api", () => ({
  feedApi: {
    list: vi.fn(),
  },
}));

vi.mock("@/features/users/users.api", () => ({
  usersApi: {
    getProfile: vi.fn(),
    getFavorites: vi.fn(),
    getComments: vi.fn(),
  },
}));

vi.mock("@/features/favorites/favorites.api", () => ({
  favoritesApi: {
    list: vi.fn(),
    add: vi.fn(),
  },
}));

vi.mock("@/services/auth.storage", () => ({
  authStorage: {
    get: vi.fn(),
  },
}));

const movie: Movie = {
  tmdbId: 42,
  title: "Inception",
  poster: null,
  backdrop: null,
  overview: "Un voleur infiltre les rêves.",
  release_date: "2010-07-16",
  vote_average: 8.8,
  runtime: 148,
  genres: ["Science-fiction"],
  credits: [{ name: "Leonardo DiCaprio", character: "Cobb", profile_path: null }],
  videos: [{ type: "Trailer", key: "abc123" }],
};

function renderWithRouter(ui: React.ReactNode, initialEntries = ["/"]) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects anonymous users to login", () => {
    vi.mocked(authStorage.get).mockReturnValue(null);

    renderWithRouter(
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<div>Zone privée</div>} />
        </Route>
        <Route path="/login" element={<div>Page login</div>} />
      </Routes>,
      ["/app"],
    );

    expect(screen.getByText("Page login")).toBeInTheDocument();
    expect(screen.queryByText("Zone privée")).not.toBeInTheDocument();
  });

  it("renders private routes when a token exists", () => {
    vi.mocked(authStorage.get).mockReturnValue("token");

    renderWithRouter(
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<div>Zone privée</div>} />
        </Route>
        <Route path="/login" element={<div>Page login</div>} />
      </Routes>,
      ["/app"],
    );

    expect(screen.getByText("Zone privée")).toBeInTheDocument();
  });
});

describe("MoviesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading then renders popular movies", async () => {
    vi.mocked(moviesApi.getPopular).mockResolvedValue([movie]);

    renderWithRouter(<MoviesPage />);

    expect(screen.getByText(/catalogue/i)).toBeInTheDocument();
    expect(await screen.findByText("Inception")).toBeInTheDocument();
  });

  it("shows the empty catalogue state", async () => {
    vi.mocked(moviesApi.getPopular).mockResolvedValue([]);

    renderWithRouter(<MoviesPage />);

    expect(await screen.findByText(/catalogue indisponible/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /réessayer/i })).toBeInTheDocument();
  });

  it("notifies when popular movies cannot be loaded", async () => {
    vi.mocked(moviesApi.getPopular).mockRejectedValue(new Error("network"));

    renderWithRouter(<MoviesPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Impossible de charger le catalogue");
    });
    expect(await screen.findByText(/catalogue indisponible/i)).toBeInTheDocument();
  });
});

describe("MovieDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders movie details and favorite action", async () => {
    vi.mocked(moviesApi.getById).mockResolvedValue(movie);
    vi.mocked(favoritesApi.list).mockResolvedValue([]);

    renderWithRouter(
      <Routes>
        <Route path="/app/movies/:id" element={<MovieDetailsPage />} />
      </Routes>,
      ["/app/movies/42"],
    );

    expect(await screen.findByRole("heading", { name: "Inception" })).toBeInTheDocument();
    expect(screen.getByText(/un voleur infiltre les rêves/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ajouter aux favoris/i })).toBeEnabled();
    expect(screen.getByText(/commentaires mockés/i)).toBeInTheDocument();
  });

  it("shows not found state when the movie request fails", async () => {
    vi.mocked(moviesApi.getById).mockRejectedValue(new Error("not found"));

    renderWithRouter(
      <Routes>
        <Route path="/app/movies/:id" element={<MovieDetailsPage />} />
      </Routes>,
      ["/app/movies/404"],
    );

    expect(await screen.findByText(/film introuvable/i)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith("Impossible de charger le film");
  });

  it("adds the movie to favorites", async () => {
    const user = userEvent.setup();
    vi.mocked(moviesApi.getById).mockResolvedValue(movie);
    vi.mocked(favoritesApi.list).mockResolvedValue([]);
    vi.mocked(favoritesApi.add).mockResolvedValue({
      _id: "fav1",
      tmdbId: 42,
      title: "Inception",
    } as never);

    renderWithRouter(
      <Routes>
        <Route path="/app/movies/:id" element={<MovieDetailsPage />} />
      </Routes>,
      ["/app/movies/42"],
    );

    await user.click(await screen.findByRole("button", { name: /ajouter aux favoris/i }));

    await waitFor(() => {
      expect(favoritesApi.add).toHaveBeenCalledWith({ tmdbId: 42, title: "Inception" });
    });
    expect(toast.success).toHaveBeenCalledWith("Ajouté aux favoris");
  });
});

describe("FeedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty feed state", async () => {
    vi.mocked(feedApi.list).mockResolvedValue([]);

    renderWithRouter(<FeedPage />);

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
    expect(await screen.findByText(/ton fil est vide/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /découvrir des utilisateurs/i })).toHaveAttribute(
      "href",
      "/app/users",
    );
  });

  it("renders feed events with movie and comment content", async () => {
    vi.mocked(feedApi.list).mockResolvedValue([
      {
        id: "event1",
        type: "COMMENT_MOVIE",
        actor: { _id: "user1", name: "Alice", email: "alice@mail.com", avatar: "avatar1" },
        targetUser: null,
        targetMovie: 42,
        movie: {
          tmdbId: 42,
          title: "Inception",
          poster: null,
          overview: "Un film dans les rêves.",
          vote_average: 8.8,
          release_date: "2010-07-16",
        },
        payload: {
          comment: {
            _id: "comment1",
            user: "user1",
            movieId: 42,
            content: "Excellent film",
            createdAt: "2026-01-01T10:00:00.000Z",
          },
        },
        createdAt: "2026-01-01T10:00:00.000Z",
      },
    ]);

    renderWithRouter(<FeedPage />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/a partagé un commentaire/i)).toBeInTheDocument();
    expect(screen.getByText(/excellent film/i)).toBeInTheDocument();
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("notifies when feed loading fails", async () => {
    vi.mocked(feedApi.list).mockRejectedValue(new Error("network"));

    renderWithRouter(<FeedPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Impossible de charger le fil d’actualité");
    });
  });
});

describe("UserProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authStorage.get).mockReturnValue(null);
  });

  it("shows invalid profile state when route id is missing", () => {
    renderWithRouter(
      <Routes>
        <Route path="/app/users" element={<UserProfilePage />} />
      </Routes>,
      ["/app/users"],
    );

    expect(screen.getByText(/utilisateur invalide/i)).toBeInTheDocument();
  });

  it("shows empty favorites and comments for a profile", async () => {
    vi.mocked(usersApi.getProfile).mockResolvedValue({
      id: "user1",
      name: "Alice",
      email: "alice@mail.com",
      followersCount: 2,
      followingCount: 1,
      isFollowing: false,
    });
    vi.mocked(usersApi.getFavorites).mockResolvedValue([]);
    vi.mocked(usersApi.getComments).mockResolvedValue([]);

    renderWithRouter(
      <Routes>
        <Route path="/app/users/:id" element={<UserProfilePage />} />
      </Routes>,
      ["/app/users/user1"],
    );

    expect(await screen.findByRole("heading", { name: "Alice" })).toBeInTheDocument();
    expect(screen.getByText(/aucun favori/i)).toBeInTheDocument();
    expect(screen.getByText(/aucun commentaire/i)).toBeInTheDocument();
  });

  it("renders favorites and comments when profile data exists", async () => {
    vi.mocked(usersApi.getProfile).mockResolvedValue({
      id: "user1",
      name: "Alice",
      isFollowing: false,
    });
    vi.mocked(usersApi.getFavorites).mockResolvedValue([
      { _id: "fav1", tmdbId: 42, title: "Fallback title", rating: 9 },
    ]);
    vi.mocked(usersApi.getComments).mockResolvedValue([
      { _id: "comment1", movieId: 43, content: "Très bon", createdAt: "2026-01-01T10:00:00.000Z" },
    ]);

    renderWithRouter(
      <Routes>
        <Route path="/app/users/:id" element={<UserProfilePage />} />
      </Routes>,
      ["/app/users/user1"],
    );

    expect(await screen.findByRole("heading", { name: "Alice" })).toBeInTheDocument();
    expect(await screen.findByText("Film 42")).toBeInTheDocument();
    expect(await screen.findByText("Film 43")).toBeInTheDocument();
    expect(screen.getByText(/très bon/i)).toBeInTheDocument();
  });

  it("shows unavailable profile state after an API error", async () => {
    vi.mocked(usersApi.getProfile).mockRejectedValue(new Error("network"));
    vi.mocked(usersApi.getFavorites).mockResolvedValue([]);
    vi.mocked(usersApi.getComments).mockResolvedValue([]);

    renderWithRouter(
      <Routes>
        <Route path="/app/users/:id" element={<UserProfilePage />} />
      </Routes>,
      ["/app/users/user1"],
    );

    expect(await screen.findByText(/profil indisponible/i)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith("Impossible de charger le profil");
  });
});
