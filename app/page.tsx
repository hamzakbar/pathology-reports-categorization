import Header from "@/components/ui/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
        Hello, World!
      </main>
    </div>
  );
}
