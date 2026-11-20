// Les métiers de la page « Qui référer ? » (Alexis, 19 nov. 2026) : des cartes à faire glisser.
// Des métiers où chaque soumission demande une visite sur place, comme chez Émondage JMF.
// Pas d'extermination ni de déneigement (exclus de la cible). Émondage et ramonage passent en premier.
// Photos : Unsplash (licence gratuite, usage commercial permis, sans attribution obligatoire),
// servies par images.unsplash.com (autorisé dans next.config.ts).

export type Metier = {
  nom: string;
  phrase: string; // ce qui le rend intéressé par Kairos
  accroche: string; // « Comme tu fais de l'émondage… »
  photo: string; // identifiant Unsplash
  icone: string; // tracé du pictogramme (viewBox 24)
  vedette?: boolean;
};

export const METIERS: Metier[] = [
  { nom: "Émondeur, arboriculteur", phrase: "Il visite chaque arbre avant de donner un prix, puis tape ses soumissions le soir.", accroche: "tu fais de l'émondage", photo: "1626828476637-5bd713ef9f22", icone: "M12 22v-7M12 15c-4 0-7-2.5-7-6a7 7 0 0 1 14 0c0 3.5-3 6-7 6zM8 22h8", vedette: true },
  { nom: "Ramoneur", phrase: "En automne, le téléphone ne dérougit pas, et chaque réparation demande une soumission.", accroche: "tu fais du ramonage", photo: "1594560225349-7d4541d32e87", icone: "M3 12 12 4l9 8M5 10v11h14V10M15 7V3h3v6.5M10 15h4v6h-4z", vedette: true },
  { nom: "Paysagiste", phrase: "Les mesures du terrain prises sur place, et des plans de prix à refaire à la maison.", accroche: "tu fais du paysagement", photo: "1734079692160-fcbe4be6ab96", icone: "M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19 13 11" },
  { nom: "Laveur de vitres", phrase: "Il compte les fenêtres sur place, et les demandes arrivent par Messenger, textos et courriels.", accroche: "tu laves des vitres", photo: "1482449609509-eae2a7ea42b7", icone: "M4 3h16v18H4zM12 3v18M4 12h16" },
  { nom: "Gouttières", phrase: "Il mesure le toit avant chaque prix, avec beaucoup de petites soumissions.", accroche: "tu poses ou nettoies des gouttières", photo: "1654531015087-8cc3d04d1b2d", icone: "M3 9h18M5 9v3a2 2 0 0 0 2 2M19 9v9M3 9 12 3l9 6" },
  { nom: "Nettoyage extérieur", phrase: "Revêtement, patio, entrée : un prix par surface, à voir avant de chiffrer.", accroche: "tu fais du nettoyage extérieur", photo: "1581883579507-019c44b711cb", icone: "M4 20 14 10M14 10l3-3 3 3-3 3zM17 4l1-2M20 6l2-1M4 20h4" },
  { nom: "Lumières de Noël", phrase: "Une visite pour mesurer, des réservations des semaines d'avance, et une saison serrée.", accroche: "tu installes des lumières de Noël", photo: "1664289342468-fa99588e60b8", icone: "M2 8c3 3 7 4 10 4s7-1 10-4M6 10.5v-1M12 12v-1M18 10.5v-1" },
  { nom: "Pavé uni et murets", phrase: "Des soumissions longues, au mètre carré, qui partent souvent trop tard.", accroche: "tu poses du pavé uni", photo: "1761637823407-ef47925c2714", icone: "M3 4h8v5H3zM13 4h8v5h-8zM3 11h5v5H3zM10 11h11v5H10zM3 18h18v3H3z" },
  { nom: "Peintre résidentiel", phrase: "Une visite pour chaque soumission, et des clients qui comparent trois prix.", accroche: "tu fais de la peinture", photo: "1717281234297-3def5ae3eee1", icone: "M14 3h6v6l-7 7-6-6zM7 10l-3 3a2 2 0 0 0 0 3l3 3a2 2 0 0 0 3 0l3-3M4 21h7" },
  { nom: "Couvreur", phrase: "Il monte sur le toit pour estimer, et ses soumissions se tapent le soir.", accroche: "tu fais des toitures", photo: "1635424824849-1b09bdcc55b1", icone: "M2 13 12 5l10 8M5 11v10h14V11M7 14h10M7 17h10" },
  { nom: "Clôtures", phrase: "Il mesure le terrain, compte les poteaux et chiffre les matériaux à la main.", accroche: "tu poses des clôtures", photo: "1769831190663-95fe8454d8c9", icone: "M5 21V7l2-3 2 3v14M15 21V7l2-3 2 3v14M3 10h18M3 16h18" },
  { nom: "Patios et terrasses", phrase: "Des soumissions détaillées, et beaucoup de demandes au printemps.", accroche: "tu construis des patios", photo: "1656646549633-80ad4bd2ab40", icone: "M3 13h18M5 13v8M19 13v8M3 17h18M12 3v6M8 9h8" },
  { nom: "Rénovation", phrase: "Cuisine, salle de bain : de longues visites et de longues soumissions, souvent faites de nuit.", accroche: "tu fais de la rénovation", photo: "1618832515490-e181c4794a45", icone: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4zM18 18l3 3" },
  { nom: "Revêtement extérieur", phrase: "Il mesure les murs sur place, et ses prix bougent avec les matériaux.", accroche: "tu poses du revêtement", photo: "1631458325834-8f678e48912c", icone: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v6M15 9v6M9 15v6" },
  { nom: "Isolation d'entretoit", phrase: "Une inspection avant chaque prix, avec des demandes qui arrivent en vagues.", accroche: "tu fais de l'isolation", photo: "1768321917437-1f1f6ae2ad28", icone: "M2 12 12 4l10 8M6 12c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 3 0M5 11v10h14V11" },
  { nom: "Thermopompes", phrase: "Une visite pour choisir l'appareil, puis une soumission à envoyer rapidement.", accroche: "tu installes des thermopompes", photo: "1776860150305-108ed577d7d4", icone: "M3 5h18v14H3zM8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0M12 8v8M8 12h8" },
  { nom: "Conduits de ventilation", phrase: "Il compte les sorties d'air sur place, et chaque client veut un prix rapide.", accroche: "tu nettoies des conduits de ventilation", photo: "1574334292321-4844f63aefef", icone: "M3 7h10a4 4 0 0 1 4 4v10M3 11h10v10M6 7v4M9 7v4" },
  { nom: "Électricien résidentiel", phrase: "Rénovation, borne de recharge : une visite avant chaque prix, et les soumissions s'empilent.", accroche: "tu fais de l'électricité résidentielle", photo: "1621905251189-08b45d6a269e", icone: "M13 2 4 14h7l-1 8 9-12h-7z" },
  { nom: "Portes et fenêtres", phrase: "Les mesures prises chez le client, et des soumissions à plusieurs options.", accroche: "tu installes des portes et fenêtres", photo: "1572739275114-ec3764ba1477", icone: "M5 3h14v18H5zM2 21h20M15 12h.01" },
  { nom: "Drain français et fondations", phrase: "Une inspection obligatoire, et des soumissions élevées qu'il faut expliquer.", accroche: "tu fais des drains français", photo: "1652303518314-e1196ef221f6", icone: "M3 9h18v4H3zM3 13v8h18v-8M8 21v-4l2-2M15 21l-1-3 2-2" },
  { nom: "Piscines", phrase: "Installation, ouverture, fermeture : des soumissions en série au printemps.", accroche: "tu t'occupes de piscines", photo: "1652878856832-887df545cb0c", icone: "M5 3v10M11 3v10M5 6h6M5 10h6M2 17c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 21c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" },
  { nom: "Planchers et sablage", phrase: "Il mesure les pièces, et les demandes arrivent de partout.", accroche: "tu poses des planchers", photo: "1624574470112-46944be68409", icone: "M3 5h18v14H3zM3 9.5h18M3 14h18M9 5v4.5M15 9.5V14M7 14v5" },
  { nom: "Ébéniste, armoires", phrase: "Des visites, des plans et des soumissions longues à monter.", accroche: "tu fais de l'ébénisterie", photo: "1544164560-adac3045edb2", icone: "M3 3h18v18H3zM12 3v18M3 12h18M9.5 7v2M14.5 7v2M9.5 15v2M14.5 15v2" },
  { nom: "Scellant d'asphalte", phrase: "Beaucoup de petites soumissions, à faire vite, sur une courte saison.", accroche: "tu fais du scellant d'asphalte", photo: "1792630862663-5efa4de633e3", icone: "M8 21 11 3M16 21 13 3M12 7v2M12 12v2M12 17v2" },
  { nom: "Tireur de joints, plâtrier", phrase: "Il visite le chantier, puis envoie un prix au pied carré.", accroche: "tu tires des joints", photo: "1770838773417-08b18661c62f", icone: "M3 21 15 9M13 7l4-4 4 4-4 4M3 15h6M3 18h4" },
];

export function photoMetier(id: string, largeur = 900): string {
  return `https://images.unsplash.com/photo-${id}?w=${largeur}&q=72&auto=format&fit=crop`;
}

export function messageMetier(m: Metier, lien: string): string {
  return `Salut [prénom] ! Comme ${m.accroche}, j'ai pensé à toi. L'Agence Jutras a un logiciel, Kairos, qui ramasse toutes tes demandes au même endroit, planifie ta tournée de visites et te laisse dicter tes soumissions sur la route. Prends 15 minutes avec Alexis pour voir si ça t'aiderait : ${lien}`;
}
