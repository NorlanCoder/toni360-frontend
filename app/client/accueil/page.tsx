export default function AccueilClientPage() {
  return (
    <>
      {/* Welcome */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Bienvenue, Mr Vagelas
      </h1>

      {/* Hero card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ maxWidth: "750px", height: "420px" }}
      >
        <img
          src="/images/ph7.png"
          alt="Pharmacie"
          className="w-full h-full object-cover"
        />
        {/* Green gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,128,80,0.85) 0%, rgba(0,128,80,0.2) 50%, transparent 100%)",
          }}
        />
        {/* Text on image */}
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-white text-2xl font-bold leading-snug">
            Trouvez facilement votre médicament.
          </p>
        </div>
      </div>
    </>
  );
}
