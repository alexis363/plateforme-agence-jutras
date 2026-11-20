"use client";
// Le parcours des références de l'ambassadeur, en montagne (décision d'Alexis du 19 nov. 2026,
// d'après la maquette Claude Design « Montagne des ambassadeurs ») : chaque référence active est
// un grimpeur posé au refuge de son étape ; le sommet, c'est la récompense versée.
// Les positions sont en % de la scène (780 × 600), pour qu'elle suive la largeur de l'écran.
import { useState } from "react";
import { ETAPES, RECOMPENSE } from "@/lib/regles.ts";

// Seulement le prénom de la référence sur la montagne, jamais le nom de l'entreprise (Alexis, 19 nov. 2026).
export type Grimpeur = { id: string; prenom: string; etape: number; nouvelle: string };

const W = 780;
const H = 600;
// Les 5 refuges le long du sentier, puis le sommet (étape 6).
const REFUGES = [
  { x: 250, y: 556 },
  { x: 560, y: 498 },
  { x: 262, y: 418 },
  { x: 530, y: 334 },
  { x: 330, y: 252 },
];
const SOMMET = { x: 390, y: 84 };
// Écarts autour d'un refuge, pour que plusieurs grimpeurs au même endroit ne se cachent pas.
const ECARTS = [[-34, 4], [34, 2], [-62, 8], [62, 6], [-8, 22], [20, -18]];
const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(2)}%`;

export default function Montagne({ grimpeurs, visites }: { grimpeurs: Grimpeur[]; visites: number }) {
  const [choisi, setChoisi] = useState(grimpeurs[0]?.id ?? null);
  const parEtape = [0, 0, 0, 0, 0, 0];
  const rang = new Map<string, number>();
  for (const g of grimpeurs) {
    rang.set(g.id, parEtape[g.etape - 1]);
    parEtape[g.etape - 1] += 1;
  }
  const atteint = (etape: number) => grimpeurs.some((g) => g.etape >= etape);
  const g = grimpeurs.find((x) => x.id === choisi) ?? null;

  return (
    <div className="montagne-zone">
      <div className="montagne" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="montagne-decor" aria-hidden="true">
          <rect width={W} height={H} fill="#F1E6D9" />
          <circle cx="640" cy="104" r="64" fill="#EFD3B4" />
          <circle cx="640" cy="104" r="44" fill="#E8BF93" />
          <polygon points="0,372 120,262 210,320 300,232 380,300 470,250 560,318 660,236 780,330 780,600 0,600" fill="#E2D0BC" />
          <polygon points="0,420 90,380 170,410 250,372 330,412 420,382 520,416 620,378 700,404 780,386 780,600 0,600" fill="#D9C4AC" />
          <polygon points="40,600 390,60 740,600" fill="#C9A684" />
          <polygon points="390,60 740,600 560,600 470,330 430,210" fill="#B38C68" />
          <polygon points="390,60 330,140 356,130 372,152 392,128 414,150 438,136 450,146" fill="#FDFBF9" />
          <polygon points="390,60 450,146 438,136 414,150 404,124" fill="#EDE3D8" />
          <g fill="#A57E5C" opacity=".45">
            <path d="M150,520 L210,470 L230,478 L180,524 Z" />
            <path d="M520,470 L580,430 L596,440 L540,478 Z" />
            <path d="M300,330 L338,300 L350,306 L312,336 Z" />
          </g>
          <path d="M150,566 C330,560 560,548 572,500 C582,462 300,452 248,412 C210,382 520,368 540,330 C556,300 340,282 318,250 C302,226 384,206 392,170 C398,140 390,112 390,84" fill="none" stroke="#FDFBF9" strokeWidth="7" strokeLinecap="round" opacity=".5" />
          <path d="M150,566 C330,560 560,548 572,500 C582,462 300,452 248,412 C210,382 520,368 540,330 C556,300 340,282 318,250 C302,226 384,206 392,170 C398,140 390,112 390,84" fill="none" stroke="#6B4E34" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
          <polygon points="0,600 0,540 70,512 150,548 230,520 300,560 380,532 470,566 560,530 650,560 720,526 780,548 780,600" fill="#8A6748" />
          <g fill="#5B4632">
            <polygon points="34,548 48,506 62,548" /><polygon points="54,552 70,494 86,552" /><polygon points="80,556 92,520 104,556" />
            <polygon points="660,548 674,508 688,548" /><polygon points="684,552 700,494 716,552" /><polygon points="712,556 724,520 736,556" />
          </g>
          <g fill="#6B4E34" opacity=".6">
            <polygon points="196,488 204,466 212,488" /><polygon points="210,490 218,470 226,490" />
            <polygon points="600,452 608,432 616,452" /><polygon points="470,286 476,270 482,286" />
          </g>
          {visites > 0 && (
            <g fill="#B9AA9C">
              {Array.from({ length: Math.min(visites, 7) }, (_, i) => (
                <ellipse key={i} cx={72 + i * 14} cy={i % 2 ? 574 : 582} rx="3.5" ry="6" />
              ))}
            </g>
          )}
          {REFUGES.map((r, i) => (
            <g key={i} transform={`translate(${r.x - 22},${r.y - 38})`}>
              <rect x="6" y="16" width="32" height="22" rx="2" fill="#FDFBF9" stroke="#6B4E34" strokeWidth="1" />
              <polygon points="2,18 22,3 42,18" fill="#6B4E34" />
              <rect x="30" y="4" width="5" height="9" fill="#6B4E34" />
              <rect x="17" y="22" width="10" height="9" rx="1.5" fill={atteint(i + 1) ? "#E8A764" : "#D8CFC4"} />
            </g>
          ))}
        </svg>

        <span className="nuage" style={{ left: pct(70, W), top: pct(70, H), width: pct(120, W), height: pct(30, H) }} />
        <span className="nuage" style={{ left: pct(110, W), top: pct(52, H), width: pct(64, W), height: pct(34, H) }} />
        <span className="nuage lent" style={{ left: pct(520, W), top: pct(196, H), width: pct(90, W), height: pct(20, H) }} />

        <div className="sommet" style={{ left: pct(SOMMET.x, W), top: pct(SOMMET.y, H) }}>
          <i className="mat" /><i className="drapeau">KAIROS</i>
          <span className={`refuge-nom${atteint(6) ? " atteint" : ""}`}>6 · Sommet · {RECOMPENSE} $ <small>{parEtape[5]}</small></span>
        </div>

        {REFUGES.map((r, i) => (
          <span key={i} className={`refuge-nom${atteint(i + 1) ? " atteint" : ""}`}
            style={r.x > W / 2
              ? { right: `calc(${pct(W - r.x, W)} + 28px)`, top: `calc(${pct(r.y, H)} - 32px)` }
              : { left: `calc(${pct(r.x, W)} + 28px)`, top: `calc(${pct(r.y, H)} - 32px)` }}>
            {i + 1} · {ETAPES[i]} <small>{parEtape[i]}</small>
          </span>
        ))}

        {grimpeurs.map((x, k) => {
          const base = x.etape >= 6 ? SOMMET : REFUGES[x.etape - 1];
          const [ex, dy] = ECARTS[(rang.get(x.id) ?? 0) % ECARTS.length];
          // L'étiquette d'un refuge de droite est à sa gauche : les grimpeurs partent alors vers la droite.
          const dx = x.etape < 6 && base.x > W / 2 ? -ex : ex;
          return (
            <button key={x.id} type="button" className={`grimpeur${x.id === choisi ? " choisi" : ""}`}
              style={{ left: pct(base.x + dx, W), top: pct(base.y + dy - 12, H), animationDelay: `${0.2 + k * 0.15}s` }}
              onClick={() => setChoisi(x.id)} aria-pressed={x.id === choisi}
              aria-label={`${x.prenom}, étape ${x.etape} sur 6 : ${ETAPES[x.etape - 1]}`}>
              <span className="g-corps">
                <i className="g-tete" /><i className="g-tuque" />
                <span className="g-tronc"><i className="g-sac" /><i className="g-veste" /><i className="g-baton" /></span>
                <i className="g-ombre" />
              </span>
              <span className="g-nom">{x.prenom}</span>
            </button>
          );
        })}

        {visites > 0 && <span className="camp">{visites} visite{visites > 1 ? "s" : ""} · camp de base</span>}
      </div>

      <div className="montagne-fiche">
        {g ? (
          <>
            <div className="mf-haut">
              <span className="mf-initiales">{g.prenom.charAt(0).toUpperCase()}</span>
              <div><b>{g.prenom}</b><small>Refuge {g.etape} sur 6</small></div>
            </div>
            <div className="mf-segments" aria-hidden="true">
              {ETAPES.map((_, i) => <i key={i} className={i < g.etape ? "fait" : ""} />)}
            </div>
            <p className="mf-etape">{ETAPES[g.etape - 1]}</p>
            <p className="mf-nouvelle">{g.nouvelle}</p>
          </>
        ) : (
          <>
            <p className="mf-etape">Votre première cordée</p>
            <p className="mf-nouvelle">Dès qu'un entrepreneur remplit sa demande par votre lien, il apparaît au pied de la montagne. Il monte d'un refuge à chaque étape, jusqu'au sommet : vos {RECOMPENSE} $.</p>
          </>
        )}
        <p className="note">Touchez un grimpeur pour voir où il est rendu. Vos {RECOMPENSE} $ sont versés dans les 24 h suivant son premier paiement.</p>
      </div>
    </div>
  );
}
