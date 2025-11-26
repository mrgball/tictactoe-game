import GameBoard from "./components/GameBoard";

export default function Home() {
  return (
    <div
      className="min-h-screen font-sans py-12 px-6 sm:px-12 lg:px-20"
      style={{
        background: 'var(--color-earth)',
      }}
    >
      <main className="mx-auto">
        <section className="bg-transparent rounded-3xl p-4 md:p-6 lg:p-8">
          <div className="mt-8 md:mt-12">
            <GameBoard />
          </div>
        </section>
      </main>
    </div>
  );
}
