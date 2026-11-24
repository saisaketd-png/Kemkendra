import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { ChemicalLoadingIndicator } from "@/shared/components/ChemicalLoadingIndicator";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-[#0F172A] antialiased">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <ChemicalLoadingIndicator
          title="Loading Chemical Catalog..."
          subtitle="Compiling verified compound specifications, manufacturer pricing, and stock records."
          className="min-h-[500px]"
        />
      </main>
      <Footer />
    </div>
  );
}
