import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  listTornei,
  creaIscrizione,
  login as loginAdmin,
  logout as logoutAdmin,
  sessioneAttiva,
  listIscrizioni,
  eliminaIscrizione,
  svuotaIscrizioni,
  salvaTorneo,
  creaTorneo,
  type Iscrizione,
  type Torneo,
} from "./services/api";

type Route =
  | "home"
  | "about"
  | "events"
  | "league"
  | "contact"
  | "login"
  | "register"
  | "registrations"
  | "tournaments";

type NavigationParams = {
  tournament?: string;
};


const A = "/assets";
const routes = new Set<Route>([
  "home",
  "about",
  "events",
  "league",
  "contact",
  "login",
  "register",
  "registrations",
  "tournaments",
]);

const tournamentCatalog = {
  "beach-volley": {
    title: "Beach Volley",
    image: "aac36.webp",
    description: "Torneo di beach volley UniPlay",
  },
  football: {
    title: "Torneo di Calcetto",
    image: "40a00.webp",
    description: "Torneo di calcetto UniPlay",
  },
  "basket-3x3": {
    title: "Basket 3×3",
    image: "fc7f7.webp",
    description: "Torneo universitario di basket 3×3",
  },
  padel: {
    title: "Padel",
    image: "3eed5.webp",
    description: "Torneo di padel UniPlay",
  },
  tennis: {
    title: "Tennis",
    image: "46a80.webp",
    description: "Torneo di tennis UniPlay",
  },
  running: {
    title: "Running Club",
    image: "91068.webp",
    description: "Evento Running Club UniPlay",
  },
  social: {
    title: "Social Event",
    image: "bed86.webp",
    description: "Evento sociale UniPlay",
  },
  league: {
    title: "Uniplay League",
    image: "0eefc.webp",
    description: "Campionato universitario Uniplay League",
  },
} as const;




function useRoute() {
  const readLocation = () => {
    const [path, search = ""] = window.location.hash.replace("#/", "").split("?");
    const value = path as Route;
    return {
      route: routes.has(value) ? value : ("home" as Route),
      tournamentSlug: new URLSearchParams(search).get("tournament") || "",
    };
  };
  const initialLocation = readLocation();
  const [route, setRoute] = useState<Route>(initialLocation.route);
  const [tournamentSlug, setTournamentSlug] = useState(initialLocation.tournamentSlug);
  useEffect(() => {
    const sync = () => {
      const location = readLocation();
      setRoute(location.route);
      setTournamentSlug(location.tournamentSlug);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const go = (next: Route, params?: NavigationParams) => {
    const search = params?.tournament ? `?tournament=${encodeURIComponent(params.tournament)}` : "";
    const nextHash = `#/${next}${search}`;
    if (nextHash === window.location.hash) window.scrollTo({ top: 0, behavior: "smooth" });
    else window.location.hash = nextHash;
  };
  return { route, tournamentSlug, go };
}

function ActionButton({
  children,
  onClick,
  variant = "dark",
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "dark" | "gold" | "outline" | "danger";
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button type={type} onClick={onClick} className={`button button-${variant} ${className}`}>
      {children}
    </button>
  );
}

function Header({ go }: { go: (route: Route) => void }) {
  const [open, setOpen] = useState(false);
  const navigate = (route: Route) => {
    setOpen(false);
    go(route);
  };
  return (
    <header className="site-header">
      <button className="wordmark" onClick={() => navigate("home")}>
        <img src="/favicon.png" alt="UniPlay Milano" />
      </button>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Apri menu"
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={open ? "nav-open" : ""} aria-label="Navigazione principale">
        <button onClick={() => navigate("about")}>About Us</button>
        <button onClick={() => navigate("events")}>Events</button>
        <button onClick={() => navigate("league")}>League</button>
        <button className="nav-cta" onClick={() => navigate("contact")}>
          Contact Us
        </button>
        <button
          className="account-button"
          onClick={() => navigate("login")}
          aria-label="Area riservata"
        >
          <img loading="lazy" decoding="async" src={`${A}/d81de.svg`} alt="" />
        </button>
      </nav>
    </header>
  );
}

function Newsletter({
  title = "STAY IN THE LOOP",
  text,
  onNotice,
}: {
  title?: string;
  text?: string;
  onNotice: (text: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.includes("@"))
      return onNotice("Inserisci nome e un indirizzo email valido.");
    onNotice(`Grazie ${name.trim()}, sei nella lista UniPlay.`);
    setName("");
    setEmail("");
  };
  return (
    <section className="newsletter">
      <div>
        <h2>{title}</h2>
        <p>
          {text ||
            "Join the community to get instant updates on upcoming tournaments, exclusive student parties, and all Uniplay events directly in your inbox."}
        </p>
      </div>
      <form onSubmit={submit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          aria-label="Name"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          aria-label="Email"
          type="email"
          required
        />
        <div className="form-buttons">
          <ActionButton type="submit">Message Us</ActionButton>
          <ActionButton
            onClick={() => window.open("https://www.instagram.com/uniplay_milano/", "_blank")}
          >
            Official Instagram
          </ActionButton>
        </div>
      </form>
    </section>
  );
}

function Footer({
  go,
  onNotice,
}: {
  go: (route: Route) => void;
  onNotice: (text: string) => void;
}) {
  return (
    <footer>
      <div className="footer-brand">
        <button className="wordmark" onClick={() => go("home")}>
          <img src="/favicon.png" alt="UniPlay Milano" />
        </button>
        <div className="socials">
          <a
            href="https://www.instagram.com/uniplay_milano/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="social-icon-link"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle className="instagram-dot" cx="17.5" cy="6.5" r="1" />
            </svg>
          </a>
          <a
            href="https://chat.whatsapp.com/JzonM5rYLPp0zJgIJr01ro"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="social-icon-link"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.5-5A8.4 8.4 0 1 1 20.5 11.7Z" />
              <path d="M9 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .6.4.7 1 1.3 1.7 1.7.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.8 1.6-.5.4-1.2.6-1.8.4-1-.2-2.1-.7-3.4-1.8-1.1-.9-1.9-2.1-2.2-3-.3-.8 0-1.7.4-2.2.2-.3.5-.5.7-.5Z" />
            </svg>
          </a>
        </div>
      </div>
      <div>
        <strong>Activities</strong>
        <button onClick={() => go("events")}>Tournaments</button>
        <button onClick={() => go("events")}>Events</button>
        <button onClick={() => go("league")}>Uniplay League</button>
      </div>
      <div>
        <strong>About Us</strong>
        <button onClick={() => go("about")}>Our Story</button>
        <button onClick={() => go("contact")}>Locations</button>
        <button onClick={() => go("contact")}>Contact</button>
      </div>
      <div>
        <strong>Legal & Support</strong>
        <button
          onClick={() =>
            onNotice("Privacy Policy: i dati inseriti in questa demo restano nel browser.")
          }
        >
          Privacy Policy
        </button>
        <button
          onClick={() => onNotice("Cookie Policy: questa demo non usa cookie di profilazione.")}
        >
          Cookie Policy
        </button>
        <button onClick={() => onNotice("Per assistenza, usa la pagina Contact Us.")}>FAQ</button>
      </div>
    </footer>
  );
}

function PageShell({
  children,
  go,
  onNotice,
}: {
  children: React.ReactNode;
  go: (route: Route) => void;
  onNotice: (text: string) => void;
}) {
  return (
    <>
      <Header go={go} />
      {children}
      <Footer go={go} onNotice={onNotice} />
    </>
  );
}

function Home({ go, onNotice }: { go: (route: Route) => void; onNotice: (text: string) => void }) {
  const experiences = [
    [
      "Student Events",
      "Where student-led events are designed by students for students with the purpose of having fun, meeting new people, and building lasting connections.",
      "35e9d.webp",
      "events",
    ],
    [
      "Sports & Tournaments",
      "Join our tennis, padel, football, and beachvolley tournaments, discover our sports events, or challenge yourself and meet new people.",
      "69571.webp",
      "events",
    ],
    [
      "Social Events",
      "Our community doesn't stop when you leave the pitch. Go from standard matches to cheering at the stadium, hanging out at the bar, and discovering niche sports.",
      "bcec3.webp",
      "league",
    ],
  ] as const;
  return (
    <PageShell go={go} onNotice={onNotice}>
      <main>
        <section className="page-title">
          <h1>UNIPLAY MILANO</h1>
          <p>
            Uniplay is Milan's student sports community, organizing tournaments, leagues, and social
            events that bring people together on and off the field.
          </p>
        </section>
        <button
          className="wide-image home-hero"
          onClick={() => go("events")}
          aria-label="Scopri gli eventi"
        >
          <img loading="lazy" decoding="async" src={`${A}/1fc3f.webp`} alt="Partita di beach volley UniPlay" />
        </button>
        <section className="content-section">
          <h2>DISCOVER THE UNIPLAY EXPERIENCE</h2>
          <div className="three-grid">
            {experiences.map(([title, text, image, route]) => (
              <button className="image-card" key={title} onClick={() => go(route)}>
                <img loading="lazy" decoding="async" src={`${A}/${image}`} alt="" />
                <h3>{title}</h3>
                <p>{text}</p>
              </button>
            ))}
          </div>
        </section>
        <section className="split feature">
          <div>
            <h2>More Than Just Sports</h2>
            <h4>Who We Are?</h4>
            <p>
              Uniplay is a student-led community that connects university students through sports,
              competitions, and social events across Milan.
            </p>
            <h4>Our Mission</h4>
            <p>
              We aim to create opportunities for students to stay active, build friendships, and
              enjoy university life beyond academics.
            </p>
            <h4>What We Offer</h4>
            <p>
              Weekly tournaments, leagues, social events, networking opportunities, and
              unforgettable experiences throughout the academic year.
            </p>
            <div className="button-row">
              <ActionButton
                onClick={() =>
                  window.open("https://chat.whatsapp.com/JzonM5rYLPp0zJgIJr01ro", "_blank")
                }
              >
                Join UniPlay
              </ActionButton>
              <ActionButton onClick={() => go("about")}>Learn More</ActionButton>
            </div>
          </div>
          <img loading="lazy" decoding="async" src={`${A}/63348.webp`} alt="La community UniPlay a un evento" />
        </section>
        <section className="content-section testimonials">
          <h2>WHAT STUDENTS ARE SAYING</h2>
          <div className="three-grid">
            {[
              [
                "“Quand je suis arrivé à Milan, je ne connaissais personne. Grâce à Uniplay, j'ai pu continuer à jouer et me faire de nouveaux amis.”",
                "Leonard Renzulli",
                "775d9.webp",
              ],
              [
                "“Tornei aperti a tutti, competizione coinvolgente grazie all’organizzazione e all’ambiente curato.”",
                "Lisa Maiocchi",
                "16a84.webp",
              ],
              [
                "“Thanks to Uniplay, I got back into sports after starting university and found an amazing group of friends.”",
                "Arhan Ozkardes",
                "fbb3f.webp",
              ],
            ].map(([quote, name, avatar]) => (
              <article className="quote" key={name}>
                <p>{quote}</p>
                <div>
                  <img loading="lazy" decoding="async" src={`${A}/${avatar}`} alt="" />
                  <small>
                    <strong>{name}</strong>
                    <br />
                    UniPlay student
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
        <Newsletter onNotice={onNotice} />
      </main>
    </PageShell>
  );
}

function About({ go, onNotice }: { go: (route: Route) => void; onNotice: (text: string) => void }) {
  return (
    <PageShell go={go} onNotice={onNotice}>
      <main>
        <section className="page-title">
          <h1>
            Our Story:
            <br />
            Empowering Students Life Through Sport
          </h1>
          <p>
            How a passionate community of students turned daily campus life into Milano’s ultimate
            sports network
          </p>
        </section>
        <div className="wide-image about-hero">
          <img loading="lazy" decoding="async" src={`${A}/40a00.webp`} alt="Studenti durante una partita di calcio" />
        </div>
        <section className="reading">
          <p>
            Uniplay Milano is a student-driven community dedicated to enhancing university life
            through sports, social events, and meaningful connections. Founded with the goal of
            bringing students together, Uniplay creates opportunities for people from different
            universities, backgrounds, and cultures to meet, engage, and build lasting
            relationships.
          </p>
          <p>
            Through a wide range of activities, including sports tournaments, networking events,
            social gatherings, and exclusive experiences, we aim to create a vibrant environment
            where students can grow both personally and socially. Our events are designed to
            encourage participation, foster new friendships, and make university life more engaging
            and memorable.
          </p>
          <p>
            Today, Uniplay brings together a growing community of students across Milan. We believe
            university is not only about academic growth, but also about experiences, connections,
            and opportunities that shape who you become.
          </p>
        </section>
        <section className="two-images">
          <img loading="lazy" decoding="async" src={`${A}/249aa.webp`} alt="Squadra UniPlay" />
          <img loading="lazy" decoding="async" src={`${A}/f2c6f.webp`} alt="Studenti in palestra" />
        </section>
        <section className="reading">
          <p>
            At Uniplay Milano, our core values are community, inclusion, fair competition, and
            personal growth. We believe every student should have the opportunity to feel part of
            something bigger, regardless of their sporting background or skill level.
          </p>
          <p>
            What truly matters to us is giving everyone the chance to enjoy the experience, meet new
            people, and leave the pitch with new friendships and memories that go far beyond the
            final score.
          </p>
        </section>
        <section className="content-section">
          <h2>Explore Our Universe</h2>
          <div className="three-grid">
            {[
              ["Upcoming Events", "ee075.webp", "events"],
              ["Running Club", "91068.webp", "events"],
              ["Uniplay League", "2c05d.webp", "league"],
            ].map(([title, image, route]) => (
              <button className="image-card" onClick={() => go(route as Route)} key={title}>
                <img loading="lazy" decoding="async" src={`${A}/${image}`} alt="" />
                <h3>{title}</h3>
              </button>
            ))}
          </div>
        </section>
        <Newsletter onNotice={onNotice} />
      </main>
    </PageShell>
  );
}

function Events({
  go,
  onNotice,
}: {
  go: (route: Route, params?: NavigationParams) => void;
  onNotice: (text: string) => void;
}) {
  const [calendarTournaments, setCalendarTournaments] = useState<Torneo[]>([]);
  useEffect(() => {
    let active = true;
    listTornei()
      .then((items) => {
        if (active) setCalendarTournaments(items);
      })
      .catch((error) => {
        console.error("Errore caricamento eventi calendario:", error);
      });
    return () => {
      active = false;
    };
  }, []);
  const sports = [
    ["Beachvolley", "tournaments and social matches on sand", "972ff.webp", "beach-volley"],
    [
      "Football (x5 & x8)",
      "University leagues from 5-to-8-a-side matches",
      "fc7f7.webp",
      "football",
    ],
    ["Padel", "Fast-paced padel tournaments for all levels", "3eed5.webp", "padel"],
    ["Tennis", "Singles championships and friendly ladders", "46a80.webp", "tennis"],
    ["Running Club", "Weekly group runs around Milano’s best parks", "91068.webp", "running"],
    ["Social Events", "Meet, share, and connect during community nights", "bed86.webp", "social"],
  ] as const;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const days = Array.from({ length: calendarCells }, (_, i) => {
    const day = i - firstWeekday + 1;
    return day < 1 || day > daysInMonth ? null : day;
  });
  return (
    <PageShell go={go} onNotice={onNotice}>
      <main>
        <section className="event-hero split">
          <img loading="lazy" decoding="async" src={`${A}/aac36.webp`} alt="DJ al beach volley UniPlay" />
          <div>
            <h1>Uniplay Beach Volley Event</h1>
            <small>Saturday 20/06</small>
            <h3>Sign Up Your Team</h3>
            <p>
              Get ready for the next tournament sponsored by Red Bull, where music, energy,
              and fierce university competition meet on the sand.
            </p>
            <ul>
              <li>DJ set all afternoon</li>
              <li>Free Red Bull</li>
            </ul>
            <ActionButton
              variant="gold"
              onClick={() => go("register", { tournament: "beach-volley" })}
            >
              Sign Up Your Team
            </ActionButton>
          </div>
        </section>
        <section className="content-section">
          <h2>Explore Our Sports & Leagues</h2>
          <div className="three-grid">
            {sports.map(([title, text, image, tournament]) => (
              <button
                className="image-card"
                key={title}
                onClick={() => go("register", { tournament })}
              >
                <img loading="lazy" decoding="async" src={`${A}/${image}`} alt="" />
                <h3>{title}</h3>
                <p>{text}</p>
              </button>
            ))}
          </div>
        </section>
        <section className="calendar content-section">
          <h2>
            {today.toLocaleDateString("en-US", { month: "long" })} | {year}
          </h2>
          <div className="weekdays">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
              (x) => (
                <span key={x}>{x}</span>
              ),
            )}
          </div>
          <div className="days">
            {days.map((day, i) => {
              const date = day ? new Date(year, month, day) : null;
              const passed = date !== null && date < today;
              const isToday = date !== null && date.getTime() === today.getTime();
              const dateKey = date
                ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : "";
              const eventsOnDay = calendarTournaments.filter(
                (event) => event.data.slice(0, 10) === dateKey,
              );
              return (
                <button
                  key={i}
                  disabled={!day || passed}
                  className={`${passed ? "past-day" : isToday ? "current-day" : ""}${eventsOnDay.length ? " has-event" : ""}`}
                  aria-label={
                    date
                      ? `${date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}${eventsOnDay.length ? `: ${eventsOnDay.map((event) => event.titolo).join(", ")}` : ""}`
                      : undefined
                  }
                  onClick={() =>
                    date &&
                    onNotice(
                      eventsOnDay.length
                        ? `${date.toLocaleDateString("it-IT")}: ${eventsOnDay.map((event) => event.titolo).join(", ")}`
                        : `Hai selezionato il ${date.toLocaleDateString("it-IT")}.`,
                    )
                  }
                >
                  <span>{day}</span>
                  {eventsOnDay.map((event) => (
                    <small className="calendar-event" key={event.id} title={event.titolo}>
                      {event.titolo}
                    </small>
                  ))}
                </button>
              );
            })}
          </div>
        </section>
        <section className="league-promo">
          <h3>Ready for the Ultimate Challenge? Discover Uniplay League</h3>
          <p>
            Experience the thrill of a fully structured championship designed for university
            students.
          </p>
          <ActionButton onClick={() => go("league")}>Explore Uniplay League</ActionButton>
        </section>
        <Newsletter title="BRING YOUR SPORT TO UNIPLAY" onNotice={onNotice} />
      </main>
    </PageShell>
  );
}

function League({
  go,
  onNotice,
}: {
  go: (route: Route, params?: NavigationParams) => void;
  onNotice: (text: string) => void;
}) {
  return (
    <PageShell go={go} onNotice={onNotice}>
      <main>
        <section className="league-hero">
          <img loading="lazy" decoding="async" src={`${A}/0eefc.webp`} alt="Squadra UniPlay festeggia la vittoria" />
          <div>
            <h1>UNIPLAY LEAGUE</h1>
            <p>
              The ultimate sports championship in Milano designed for university students:
              high-level competition, professional organization, and adrenaline.
            </p>
            <ActionButton onClick={() => go("register", { tournament: "league" })}>
              Join the League
            </ActionButton>
          </div>
        </section>
        <section className="content-section feature-list">
          <div className="split">
            <div>
              <h2>The Ultimate Competitive Stage</h2>
              <p>
                This is where the game gets serious. Uniplay League brings you a fully structured
                championship with professional referees, detailed match statistics, and live-updated
                standings.
              </p>
              <ActionButton onClick={() => go("events")}>See events</ActionButton>
            </div>
            <img loading="lazy" decoding="async" src={`${A}/9a71d.webp`} alt="Partita di calcio UniPlay" />
          </div>
          <div className="split reverse">
            <div>
              <h2>Built for University Students</h2>
              <p>
                An elite sporting environment tailored around your student lifestyle, allowing you
                to challenge your peers, unleash your competitive spirit, and share the pitch with a
                community that shares your drive.
              </p>
              <ActionButton onClick={() => go("contact")}>Contact us</ActionButton>
            </div>
            <img loading="lazy" decoding="async" src={`${A}/48033.webp`} alt="Studenti durante una partita" />
          </div>
        </section>
        <section className="content-section">
          <h2>2026 - Championship Highlights</h2>
          <div className="highlights">
            <article>
              <img loading="lazy" decoding="async" src={`${A}/999f7.webp`} alt="Squadra vincitrice" />
              <h3>The Final Trophy</h3>
              <p>
                The ultimate glory has been claimed by DISSIDENTI FROGHELLI, who dominated the 2026
                season.
              </p>
            </article>
            <div>
              <article>
                <img loading="lazy" decoding="async" src={`${A}/cfbb3.webp`} alt="Secondi classificati" />
                <h3>Runners-Up: WOND7RS</h3>
                <p>An incredible run, wrapping up a solid season.</p>
              </article>
              <article>
                <img loading="lazy" decoding="async" src={`${A}/cf37b.webp`} alt="Miglior giocatore" />
                <h3>Final MVP</h3>
                <p>Honoring the absolute best player of the final match.</p>
              </article>
            </div>
          </div>
        </section>
        <Newsletter title="NEED MORE INFORMATION?" onNotice={onNotice} />
      </main>
    </PageShell>
  );
}

function Contact({
  go,
  onNotice,
}: {
  go: (route: Route) => void;
  onNotice: (text: string) => void;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    onNotice("Messaggio inviato. Il team UniPlay ti risponderà al più presto.");
    form.reset();
  };
  return (
    <PageShell go={go} onNotice={onNotice}>
      <main>
        <section className="contact-layout">
          <div>
            <h1>GET IN TOUCH</h1>
            <p className="lead">
              Whether you are looking for your next match in Milan or want to bring the UniPlay
              energy to your company, you are in the right place.
            </p>
            <p>
              Se vuoi partecipare a un torneo, proporre una collaborazione o portare UniPlay nella
              tua università, scrivici. Ti risponderemo con tutte le informazioni utili.
            </p>
            <form className="contact-form" onSubmit={submit}>
              <h2>Contact me</h2>
              <div className="form-grid">
                <label>
                  First name
                  <input name="firstName" placeholder="Jane" required />
                </label>
                <label>
                  Last name
                  <input name="lastName" placeholder="Smitherton" required />
                </label>
              </div>
              <label>
                Email address
                <input type="email" name="email" placeholder="email@esempio.it" required />
              </label>
              <label>
                Your message
                <textarea name="message" placeholder="Enter your question or message" required />
              </label>
              <ActionButton type="submit">SUBMIT</ActionButton>
            </form>
          </div>
          <img loading="lazy" decoding="async" src={`${A}/9a71d.webp`} alt="Studenti giocano a calcio" />
        </section>
        <Newsletter title="NEED MORE INFORMATION?" onNotice={onNotice} />
      </main>
    </PageShell>
  );
}


const PAYMENT_URL = "https://example.com/pagamento"; // SEGNAPOSTO: sostituire con il link reale

function RegistrationPage({
  go,
  onNotice,
  tournamentSlug,
}: {
  go: (route: Route) => void;
  onNotice: (text: string) => void;
  tournamentSlug: string;
}) {
  const slug = tournamentSlug in tournamentCatalog ? tournamentSlug : "beach-volley";
  const tournament = tournamentCatalog[slug as keyof typeof tournamentCatalog];
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    first: "",
    last: "",
    squadra: "",
    phone: "",
    email: "",
    privacy: false,
  });

    useEffect(() => {
    let active = true;
    setLoading(true);
    listTornei()
      .then((list) => {
        console.log("Tornei ricevuti:", list);
        if (active) setTorneo(list.find((t) => t.slug === slug) ?? null);
      })
      .catch((err) => {
        console.error("Errore caricamento tornei:", err);
        if (active) onNotice("Impossibile caricare i dati del torneo. Riprova più tardi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);
  
  const update = (field: "first" | "last" | "squadra" | "phone" | "email", value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const postiLiberi = torneo ? torneo.posti_totali - torneo.occupati : 0;
  const pieno = !!torneo && postiLiberi <= 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!torneo || pieno) return;
    if (!form.privacy) return onNotice("Devi accettare l'informativa privacy per continuare.");
    setSending(true);
    try {
      await creaIscrizione({
        torneo_id: torneo.id,
        nome: form.first.trim(),
        cognome: form.last.trim(),
        email: form.email.trim(),
        telefono: form.phone.trim(),
        squadra: form.squadra.trim(),
      });
      setForm({ first: "", last: "", squadra: "", phone: "", email: "", privacy: false });
      onNotice("Iscrizione registrata! Ti porto al pagamento…");
      window.setTimeout(() => window.location.assign(PAYMENT_URL), 1200);
    } catch {
      onNotice("Errore nel salvataggio dell'iscrizione. Riprova.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell go={go} onNotice={onNotice}>
      <main className="registration-page">
        <div className="registration-hero">
          <img loading="lazy" decoding="async" src={`${A}/${tournament.image}`} alt={tournament.description} />
        </div>
        <section className="registration-section">
          <p className="registration-context">Ti stai iscrivendo a</p>
          <h1>{torneo?.titolo ?? tournament.title}</h1>

          {loading && <p className="registration-intro">Caricamento…</p>}

          {!loading && !torneo && (
            <p className="registration-intro">
              Le iscrizioni per questo evento non sono ancora aperte. Torna a trovarci presto!
            </p>
          )}

          {torneo && (
            <>
              <p className="registration-intro">
                {new Date(torneo.data).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {torneo.luogo} ·{" "}
                {torneo.quota.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                <br />
                {pieno ? "Posti esauriti" : `Posti disponibili: ${postiLiberi}`}
              </p>
              <form className="registration-form" onSubmit={submit}>
                <label>
                  Nome
                  <input
                    value={form.first}
                    onChange={(e) => update("first", e.target.value)}
                    placeholder="Giulia"
                    autoComplete="given-name"
                    required
                  />
                </label>
                <label>
                  Cognome
                  <input
                    value={form.last}
                    onChange={(e) => update("last", e.target.value)}
                    placeholder="Rossi"
                    autoComplete="family-name"
                    required
                  />
                </label>
                <label>
                  Nome della squadra
                  <input
                    value={form.squadra}
                    onChange={(e) => update("squadra", e.target.value)}
                    placeholder="Uniplay Team"
                    autoComplete="organization"
                    required
                  />
                </label>
                <label>
                  Numero di telefono
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+39 333 123 4567"
                    autoComplete="tel"
                    required
                  />
                </label>
                <label>
                  Indirizzo email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="nome@universita.it"
                    autoComplete="email"
                    required
                  />
                </label>
                <label
                  className="full-field"
                  style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
                >
                  <input
                    type="checkbox"
                    checked={form.privacy}
                    onChange={(e) => setForm((c) => ({ ...c, privacy: e.target.checked }))}
                    style={{ width: "auto", marginTop: "0.25rem" }}
                    required
                  />
                  <span>
                    Ho letto e accetto l'informativa privacy e acconsento al trattamento dei miei
                    dati per la gestione dell'iscrizione.
                  </span>
                </label>
                <ActionButton type="submit" className="full-field">
                  {pieno
                    ? "POSTI ESAURITI"
                    : sending
                      ? "INVIO IN CORSO…"
                      : "CONFERMA E VAI AL PAGAMENTO"}
                </ActionButton>
              </form>
              <small className="storage-note">
                Dopo la conferma verrai indirizzato alla piattaforma di pagamento esterna per
                versare la quota di iscrizione.
              </small>
            </>
          )}
        </section>
      </main>
    </PageShell>
  );
}
function Login({
  go,
  onNotice,
  onLogin,
}: {
  go: (route: Route) => void;
  onNotice: (text: string) => void;
  onLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      await loginAdmin(email.trim(), password);
      onLogin();
      go("registrations");
    } catch {
      onNotice("Email o password non corrette.");
    } finally {
      setSending(false);
    }
  };
  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <button className="wordmark" type="button" onClick={() => go("home")}>
          <img src="/favicon.png" alt="UniPlay Milano" />
        </button>
        <h1>Area Riservata</h1>
        <p>La tua community, dietro le quinte.</p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="la-tua-email@esempio.it"
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Inserisci la password"
            autoComplete="current-password"
            required
          />
        </label>
        <ActionButton type="submit">{sending ? "Accesso…" : "Accedi"}</ActionButton>
        <small>Accesso riservato al team Uniplay Milano.</small>
      </form>
      <div className="login-footer">UNIPLAY MILANO · AREA RISERVATA</div>
    </main>
  );
}

function AdminHeader({
  tab,
  go,
  logout,
}: {
  tab: "registrations" | "tournaments";
  go: (route: Route) => void;
  logout: () => void;
}) {
  return (
    <>
      <header className="admin-header">
        <strong>UNIPLAY MILANO</strong>
        <span>Area Riservata</span>
        <ActionButton variant="outline" onClick={logout}>
          Esci
        </ActionButton>
      </header>
      <nav className="admin-tabs">
        <button
          className={tab === "registrations" ? "active" : ""}
          onClick={() => go("registrations")}
        >
          Iscrizioni
        </button>
        <button className={tab === "tournaments" ? "active" : ""} onClick={() => go("tournaments")}>
          Gestione tornei
        </button>
      </nav>
    </>
  );
}

function Registrations({
  go,
  onNotice,
  logout,
}: {
  go: (route: Route) => void;
  onNotice: (text: string) => void;
  logout: () => void;
}) {
  const [registrations, setRegistrations] = useState<Iscrizione[]>([]);
  const [tornei, setTornei] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tutti i tornei");
  const [query, setQuery] = useState("");

  const reload = async () => {
    try {
      const [iscr, torn] = await Promise.all([listIscrizioni(), listTornei()]);
      setRegistrations(iscr);
      setTornei(torn);
    } catch (err) {
      console.error("Errore caricamento iscrizioni:", err);
      onNotice("Impossibile caricare le iscrizioni.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    reload();
  }, []);

  const formatDate = (iso: string) => new Intl.DateTimeFormat("it-IT").format(new Date(iso));

  const visible = registrations.filter(
    (r) =>
      (filter === "Tutti i tornei" || r.torneo_titolo === filter) &&
      `${r.nome} ${r.cognome} ${r.squadra} ${r.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  const tournamentNames = tornei.map((t) => t.titolo);
  const postiTotali = tornei.reduce((sum, t) => sum + t.posti_totali, 0);
  const prossimo = tornei.find((t) => new Date(t.data) >= new Date()) ?? tornei[0];

  const remove = async (id: number) => {
    try {
      await eliminaIscrizione(id);
      setRegistrations((items) => items.filter((x) => x.id !== id));
      onNotice("Iscrizione eliminata.");
    } catch {
      onNotice("Errore durante l'eliminazione.");
    }
  };

  const svuota = async () => {
    if (!window.confirm("Vuoi eliminare TUTTE le iscrizioni? L'operazione è definitiva.")) return;
    try {
      await svuotaIscrizioni();
      setRegistrations([]);
      onNotice("Tutte le iscrizioni sono state eliminate.");
    } catch {
      onNotice("Errore durante l'eliminazione.");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Data", "Nome", "Cognome", "Nome della squadra", "Email", "Telefono", "Torneo"],
      ...visible.map((r) => [
        formatDate(r.created_at),
        r.nome,
        r.cognome,
        r.squadra,
        r.email,
        r.telefono,
        r.torneo_titolo,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "iscrizioni-uniplay.csv";
    link.click();
    URL.revokeObjectURL(url);
    onNotice("File CSV esportato.");
  };

  return (
    <main className="admin-page">
      <AdminHeader tab="registrations" go={go} logout={logout} />
      <section>
        <h1>Iscrizioni</h1>
        <p className="lead">Tieni il passo con chi scende in campo.</p>
        <div className="stats">
          <article>
            <span>Iscritti totali</span>
            <strong>{registrations.length}</strong>
            <small>Tra tutti i tornei</small>
          </article>
          <article>
            <span>Posti rimasti</span>
            <strong>{Math.max(0, postiTotali - registrations.length)}</strong>
            <small>Su {postiTotali} posti totali</small>
          </article>
          <article>
            <span>Prossimo torneo</span>
            <b>{prossimo?.titolo ?? "—"}</b>
            <small>
              {prossimo
                ? new Date(prossimo.data).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </small>
          </article>
        </div>
        <div className="admin-tools">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filtra torneo"
          >
            <option>Tutti i tornei</option>
            {tournamentNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome, squadra o email"
            aria-label="Cerca iscrizioni"
          />
          <ActionButton onClick={exportCsv}>↓ &nbsp; Esporta CSV</ActionButton>
        </div>
        <p className="count">{loading ? "Caricamento…" : `${visible.length} iscrizioni`}</p>
        <div className="registration-table">
          <div className="table-head">
            <span>Data iscrizione</span>
            <span>Nome</span>
            <span>Cognome</span>
            <span>Nome della squadra</span>
            <span>Email</span>
            <span>Telefono</span>
            <span>Torneo</span>
            <span>Azioni</span>
          </div>
          {visible.map((r) => (
            <article key={r.id}>
              <span className="date">{formatDate(r.created_at)}</span>
              <b>
                {r.nome} {r.cognome}
              </b>
              <span className="first">{r.nome}</span>
              <span className="last">{r.cognome}</span>
              <span className="team">
                <span className="mobile-only">Nome della squadra: </span>
                {r.squadra || "—"}
              </span>
              <span>{r.email}</span>
              <span>{r.telefono}</span>
              <em>{r.torneo_titolo}</em>
              <button
                onClick={() => remove(r.id)}
                aria-label={`Elimina iscrizione di ${r.nome} ${r.cognome}`}
              >
                <img loading="lazy" decoding="async" src={`${A}/ee049.svg`} alt="" />
              </button>
            </article>
          ))}
        </div>
        {!loading && visible.length === 0 && (
          <div className="empty">Nessuna iscrizione trovata.</div>
        )}
        <div className="danger-zone">
          <ActionButton variant="danger" onClick={svuota}>
            Svuota tutte le iscrizioni
          </ActionButton>
          <span>Eliminazione definitiva delle iscrizioni dal database.</span>
        </div>
      </section>
      <div className="admin-footer">Uniplay Milano · Gestione community</div>
    </main>
  );
}

function TournamentCard({
  tournament,
  onSaved,
  onNotice,
}: {
  tournament: Torneo;
  onSaved: () => void;
  onNotice: (text: string) => void;
}) {
  const [draft, setDraft] = useState(tournament);
  const [saving, setSaving] = useState(false);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await salvaTorneo({
        id: draft.id,
        titolo: draft.titolo,
        data: draft.data,
        luogo: draft.luogo,
        quota: Number(String(draft.quota).replace(",", ".")),
        posti_totali: draft.posti_totali,
      });
      onNotice("Torneo aggiornato con successo.");
      onSaved();
    } catch (err) {
      console.error("Errore salvataggio torneo:", err);
      onNotice("Errore nel salvataggio del torneo.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="tournament-card" onSubmit={save}>
      <h2>{draft.titolo}</h2>
      <label>
        Titolo
        <input
          value={draft.titolo}
          onChange={(e) => setDraft({ ...draft, titolo: e.target.value })}
          required
        />
      </label>
      <label>
        Data
        <input
          type="date"
          value={draft.data}
          onChange={(e) => setDraft({ ...draft, data: e.target.value })}
          required
        />
      </label>
      <label>
        Luogo
        <input
          value={draft.luogo}
          onChange={(e) => setDraft({ ...draft, luogo: e.target.value })}
          required
        />
      </label>
      <div className="form-grid">
        <label>
          Quota (€)
          <input
            value={String(draft.quota)}
            onChange={(e) => setDraft({ ...draft, quota: e.target.value as unknown as number })}
            required
          />
        </label>
        <label>
          Posti totali
          <input
            type="number"
            min={draft.occupati}
            value={draft.posti_totali}
            onChange={(e) => setDraft({ ...draft, posti_totali: Number(e.target.value) })}
            required
          />
        </label>
      </div>
      <span className="occupancy">
        Posti occupati: {draft.occupati} / {draft.posti_totali}
      </span>
      <div className="progress">
        <i
          style={{
            width: `${Math.min(100, draft.posti_totali ? (draft.occupati / draft.posti_totali) * 100 : 0)}%`,
          }}
        />
      </div>
      <ActionButton type="submit">{saving ? "Salvataggio…" : "Salva modifiche"}</ActionButton>
    </form>
  );
}

function Tournaments({
  go,
  onNotice,
  logout,
}: {
  go: (route: Route) => void;
  onNotice: (text: string) => void;
  logout: () => void;
}) {
  const [tornei, setTornei] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    try {
      setTornei(await listTornei());
    } catch (err) {
      console.error("Errore caricamento tornei:", err);
      onNotice("Impossibile caricare i tornei.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    reload();
  }, []);
  const add = async () => {
    try {
      await creaTorneo();
      onNotice("Nuovo torneo aggiunto. Completa i dettagli e salva.");
      reload();
    } catch {
      onNotice("Errore nella creazione del torneo.");
    }
  };
  return (
    <main className="admin-page">
      <AdminHeader tab="tournaments" go={go} logout={logout} />
      <section>
        <h1>Gestione tornei</h1>
        <p className="lead">Aggiorna i dettagli. Al resto pensa il campo.</p>
        <ActionButton className="add-tournament" onClick={add}>
          ＋ &nbsp; Aggiungi torneo
        </ActionButton>
        {loading && <p className="count">Caricamento…</p>}
        <div className="tournament-grid">
          {tornei.map((t) => (
            <TournamentCard
              key={`${t.id}-${t.titolo}-${t.data}-${t.quota}-${t.posti_totali}`}
              tournament={t}
              onSaved={reload}
              onNotice={onNotice}
            />
          ))}
        </div>
      </section>
      <div className="admin-footer">Uniplay Milano · Gestione community</div>
    </main>
  );
}

export default function App() {
  const { route, tournamentSlug, go } = useRoute();
  const [notice, setNotice] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    sessioneAttiva().then(setAuthenticated);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  const logout = async () => {
    await logoutAdmin();
    setAuthenticated(false);
    go("login");
    setNotice("Sessione terminata.");
  };
  const page = useMemo(() => {
    const common = { go, onNotice: setNotice };
    if ((route === "registrations" || route === "tournaments") && !authenticated)
      return <Login {...common} onLogin={() => setAuthenticated(true)} />;
    switch (route) {
      case "about":
        return <About {...common} />;
      case "events":
        return <Events {...common} />;
      case "league":
        return <League {...common} />;
      case "contact":
        return <Contact {...common} />;
      case "register":
        return (
          <RegistrationPage
            {...common}
            tournamentSlug={tournamentSlug}
          />
        );
      case "login":
        return authenticated ? (
          <Registrations {...common} logout={logout} />
        ) : (
          <Login {...common} onLogin={() => setAuthenticated(true)} />
        );
      case "registrations":
        return (
          <Registrations {...common} logout={logout} />
        );
      case "tournaments":
        return (
          <Tournaments {...common} logout={logout} />
        );
      default:
        return <Home {...common} />;
    }
  }, [route, tournamentSlug, authenticated,]);
  return (
    <>
      {page}
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Chiudi">
            ×
          </button>
        </div>
      )}
    </>
  );
}
