/**
 * Page d'accueil Toni360
 * Affiche le Header, Hero et Footer en superposition
 */
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    // Container relatif pour permettre le positionnement absolu des enfants
    <div className="relative min-h-screen">
      {/* Header en haut (position absolute) */}
      <Header />
      
      {/* Hero au centre avec image de fond */}
      <Hero />
      
      {/* Footer en bas (position absolute) */}
      <Footer />
    </div>
  );
}
