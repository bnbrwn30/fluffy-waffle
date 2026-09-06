import fs from "node:fs";
import path from "node:path";
import Hero from "@/components/sections/Hero";
import Forest from "@/components/sections/Forest";
import Journey from "@/components/sections/Journey";
import Origins from "@/components/sections/Origins";
import Quality from "@/components/sections/Quality";
import Logistics from "@/components/sections/Logistics";
import SisterCompanies from "@/components/sections/SisterCompanies";
import SampleForm from "@/components/sections/SampleForm";
import Footer from "@/components/sections/Footer";

/**
 * Which journey photographs are actually present.
 *
 * Resolved here, on the server at build time, rather than by probing each URL
 * from the browser — nine 404s per page load is a noisy console on a fresh
 * deploy, and the answer never changes between requests.
 */
function availablePhotos(): string[] {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public", "img", "journey"))
      .filter((f) => /\.(jpe?g|webp|png)$/i.test(f))
      .map((f) => f.replace(/\.[^.]+$/, ""));
  } catch {
    return [];
  }
}

export default function Home() {
  const photos = availablePhotos();

  return (
    <>
      <main id="main">
        <Hero />
        <Forest />
        <Journey available={photos} />
        <Origins />
        <Quality />
        <Logistics />
        <SisterCompanies />
        <SampleForm />
      </main>
      <Footer />
    </>
  );
}
