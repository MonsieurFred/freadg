import Link from 'next/link'

const HERO_RECIPES = [
  {
    title: 'Bowl saumon & brocoli',
    time: '24 min',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Pâtes ricotta courgette',
    time: '18 min',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Curry pois chiches',
    time: '28 min',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  },
]

const FEATURES = [
  ['01', 'Repas complets', 'Chaque assiette combine protéines, légumes, bons glucides et matières grasses utiles pour nourrir le corps.'],
  ['02', 'Pensé par un chef', 'Des recettes saines mais gourmandes, construites pour être bonnes, simples et réalistes.'],
  ['03', 'Courses auto', 'Les quantités sont rangées par rayon, avec la possibilité de préparer la liste en click & collect dans tes magasins préférés.'],
]

export default function LandingPage() {
  return (
    <main style={{ fontFamily: 'var(--font-sans)', background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 48px', borderBottom: '1px solid var(--border)', background: 'var(--cream)' }} className="px-5 md:px-12">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ width: 34, height: 34, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--peach)', fontFamily: 'var(--font-serif)', fontSize: 18, flexShrink: 0 }}>F</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--ink)' }}>Fridge</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
          <Link href="#comment-ca-marche" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Comment ça marche</Link>
          <Link href="#pricing" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Prix</Link>
          <Link href="/login" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Connexion</Link>
          <Link href="/register" className="btn-primary" style={{ fontSize: 13 }}>Commencer</Link>
        </nav>
        <Link href="/register" className="btn-primary md:hidden" style={{ fontSize: 13 }}>Commencer</Link>
      </header>

      {/* Hero 50/50 */}
      <section className="grid min-h-[560px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Left: cream */}
        <div
          className="flex flex-col justify-center px-8 py-16 md:px-12"
          style={{ borderRight: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-7">
            <div style={{ width: 6, height: 6, background: 'var(--green)', flexShrink: 0 }} />
            <span className="eyebrow">Planification de repas</span>
          </div>
          <h1
            className="serif"
            style={{ fontSize: 'clamp(38px, 5vw, 66px)', lineHeight: 1.0, color: 'var(--ink)', letterSpacing: '-0.02em', maxWidth: 480 }}
          >
            Ta semaine<br /><em>prête à cuisiner.</em>
          </h1>
          <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.8, color: 'var(--muted)', maxWidth: 380 }}>
            Des repas sains, complets et équilibrés, pensés par un chef cuisinier pour apporter au corps ce qu’il faut: protéines, fibres, légumes et énergie durable.
          </p>
          <div className="flex flex-wrap gap-3 mt-9">
            <Link href="/register" className="btn-primary">Essayer Fridge</Link>
            <Link href="/dashboard" className="btn-secondary">Voir la sélection →</Link>
          </div>
          {/* Stats */}
          <div className="flex mt-12 pt-7" style={{ borderTop: '1px solid var(--border)' }}>
            {[
              ['6,99 €', '/mois'],
              ['Complet', 'protéines · fibres'],
              ['Zéro', 'publicité'],
            ].map(([v, l], i) => (
              <div
                key={l}
                className="pr-8 mr-8"
                style={{ borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="serif" style={{ fontSize: 28, color: 'var(--ink)' }}>{v}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: ink image panel */}
        <div className="relative overflow-hidden" style={{ background: 'var(--ink)' }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.5,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(23,33,27,0.2) 0%, rgba(23,33,27,0.85) 100%)' }}
          />
          <div className="absolute bottom-9 left-9 right-9">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 8 }}>
              Sélection de la semaine
            </p>
            <h2 className="serif" style={{ fontSize: 32, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
              20 dîners sains<br />par semaine, zéro casse-tête.
            </h2>
            <div className="flex flex-col gap-2">
              {HERO_RECIPES.map((r) => (
                <div
                  key={r.title}
                  className="flex items-center gap-3"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    padding: '10px 14px',
                    borderLeft: '2px solid var(--coral)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundImage: `url(${r.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--peach)', marginTop: 2 }}>{r.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="flex justify-between items-center mt-4"
              style={{ background: 'var(--coral)', padding: '14px 18px' }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Courses générées</div>
                <div className="serif" style={{ fontSize: 22, color: '#fff', marginTop: 2 }}>38 articles</div>
              </div>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>triés par rayon →</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="comment-ca-marche" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {FEATURES.map(([n, title, desc], i) => (
            <div
              key={title}
              className="p-10"
              style={{ borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="serif italic mb-4" style={{ fontSize: 13, color: 'var(--coral)' }}>{n}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>{title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="grid" style={{ borderTop: '1px solid var(--border)', gridTemplateColumns: '1fr 1fr' }}>
        <div className="px-12 py-14" style={{ borderRight: '1px solid var(--border)' }}>
          <div className="eyebrow-coral mb-4">Abonnement simple</div>
          <h2 className="serif" style={{ fontSize: 42, color: 'var(--ink)', lineHeight: 1.1, maxWidth: 400, marginBottom: 16 }}>
            Tout Fridge pour 6,99 € / mois.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--muted)', maxWidth: 380 }}>
            Recettes équilibrées, planning, favoris, quantités ajustées, liste de courses automatique et préparation possible en click & collect dans tes magasins préférés. De la vraie bonne nourriture pour le corps, sans pub ni menus impossibles.
          </p>
        </div>
        <div className="px-12 py-14 flex flex-col justify-center" style={{ background: 'var(--ink)' }}>
          <div className="mb-6">
            <div className="serif" style={{ fontSize: 52, color: '#fff' }}>6,99 €</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>par mois · sans engagement</div>
          </div>
          <Link href="/register" className="btn-primary text-center" style={{ fontSize: 15 }}>
            Commencer maintenant
          </Link>
        </div>
      </section>
    </main>
  )
}
