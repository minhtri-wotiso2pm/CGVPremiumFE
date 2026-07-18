import { type FC } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { usePersonDetail } from "../hooks/usePersonDetail";
import { usePersonMovies } from "../hooks/usePersonMovies";
import "@/features/movies/components/movies.css";
import "./persons-public.css";

/* ── Small helpers ── */
function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function formatDate(iso?: string | null): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function calcAge(iso?: string | null): number | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 && age < 130 ? age : null;
}

/* ── Icons ── */
const GlobeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);
const CakeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
        <path d="M2 21h20" /><path d="M12 4v3M8 5v2M16 5v2" />
    </svg>
);
const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const PersonDetailPage: FC = () => {
    const { personId } = useParams<{ personId: string }>();
    const id = Number(personId);
    const location = useLocation();
    const navigate = useNavigate();

    const isPublic = location.pathname.startsWith("/persons/");
    const homeLink = isPublic ? "/" : "/customer";

    const { data: person, isLoading, isError } = usePersonDetail(Number.isFinite(id) ? id : null);
    const { data: filmography = [] } = usePersonMovies(id); // stub: disabled until BE ships the endpoint

    /* ── Loading ── */
    if (isLoading) {
        return (
            <div className="pdp-root">
                <div className="pdp-hero">
                    <div className="pdp-hero__content">
                        <div className="pdp-photo--fallback" style={{ opacity: 0.4 }} />
                        <div className="pdp-info" style={{ width: "100%" }}>
                            <div style={{ height: 44, width: "50%", background: "var(--cgv-surface)", borderRadius: 8, marginBottom: 16 }} />
                            <div style={{ height: 20, width: "30%", background: "var(--cgv-surface)", borderRadius: 8, marginBottom: 24 }} />
                            <div style={{ height: 120, width: "80%", background: "var(--cgv-surface)", borderRadius: 8 }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Error / not found ── */
    if (isError || !person) {
        return (
            <div className="pdp-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="cgv-state-card">
                    <div className="cgv-state-card__icon-ring"><span className="cgv-state-card__icon">🎭</span></div>
                    <h2 className="cgv-state-card__title">Person not found</h2>
                    <p className="cgv-state-card__body">We couldn't load this profile. It may have been removed or the link is invalid.</p>
                    <button className="cgv-state-card__btn cgv-state-card__btn--primary" onClick={() => navigate(homeLink)}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const dob = formatDate(person.dateOfBirth);
    const age = calcAge(person.dateOfBirth);

    return (
        <div className="pdp-root cgv-fade-in">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="cgv-detail-breadcrumb">
                <div className="cgv-detail-breadcrumb__inner">
                    <Link to={homeLink} className="cgv-detail-breadcrumb__link">Home</Link>
                    <span className="cgv-detail-breadcrumb__sep" aria-hidden="true">›</span>
                    <span className="cgv-detail-breadcrumb__current" aria-current="page">{person.name}</span>
                </div>
            </nav>

            {/* Hero */}
            <header className="pdp-hero">
                {person.photoUrl && (
                    <div className="pdp-hero__bg" style={{ backgroundImage: `url(${person.photoUrl})` }} aria-hidden="true" />
                )}
                <div className="pdp-hero__overlay" aria-hidden="true" />
                <div className="pdp-hero__content">
                    <div className="pdp-photo-wrap">
                        {person.photoUrl ? (
                            <img src={person.photoUrl} alt={person.name} className="pdp-photo" />
                        ) : (
                            <div className="pdp-photo--fallback" aria-hidden="true">{initials(person.name)}</div>
                        )}
                    </div>

                    <div className="pdp-info">
                        <p className="pdp-eyebrow">Cast &amp; Crew</p>
                        <h1 className="pdp-name">{person.name}</h1>

                        <div className="pdp-meta">
                            {person.nationality && (
                                <span className="pdp-chip"><GlobeIcon /> <strong>{person.nationality}</strong></span>
                            )}
                            {dob && (
                                <span className="pdp-chip">
                                    <CakeIcon /> {dob}{age != null && <> · <strong>{age}</strong> yrs</>}
                                </span>
                            )}
                            {person.gender && (
                                <span className="pdp-chip"><UserIcon /> {person.gender}</span>
                            )}
                        </div>

                        <p className="pdp-bio-label">Biography</p>
                        {person.biography ? (
                            <p className="pdp-bio">{person.biography}</p>
                        ) : (
                            <p className="pdp-bio pdp-bio--empty">No biography available yet.</p>
                        )}
                    </div>
                </div>
            </header>

            {/* Body */}
            <div className="pdp-body">
                <section className="pdp-section" aria-labelledby="filmography-heading">
                    <div className="pdp-section__heading">
                        <h2 className="pdp-section__title" id="filmography-heading">Filmography</h2>
                        <div className="pdp-section__rule" aria-hidden="true" />
                    </div>

                    {filmography.length > 0 ? (
                        <div className="pdp-grid">
                            {/* Rendered once the movies-by-person endpoint is available. */}
                            {filmography.map((m) => (
                                <Link key={m.movieId} to={`${isPublic ? "" : "/customer"}/movies/${m.movieId}`} style={{ color: "var(--cgv-text-primary)" }}>
                                    {m.title}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="pdp-placeholder">
                            <span className="pdp-placeholder__icon">🎬</span>
                            <p className="pdp-placeholder__title">Filmography coming soon</p>
                            <p className="pdp-placeholder__sub">The list of movies featuring {person.name} is being updated.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PersonDetailPage;
