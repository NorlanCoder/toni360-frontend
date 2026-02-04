/**
 * Page d'accueil Toni360
 * Affiche le Header et Hero
 */
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    // Container relatif pour permettre le positionnement absolu des enfants
    <div className="relative min-h-screen">
      {/* Header en haut (position absolute) */}
      <Header />
      
      {/* Hero au centre avec image de fond */}
      <Hero />
    </div>
  );
}
