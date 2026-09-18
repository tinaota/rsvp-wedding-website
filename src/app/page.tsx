import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Schedule from "@/components/Schedule";
import Venue from "@/components/Venue";
import Attire from "@/components/Attire";
import Footer from "@/components/Footer";
import StickyRsvpBar from "@/components/StickyRsvpBar";
import RsvpFlow from "@/components/rsvp/RsvpFlow";

export default function Home() {
  return (
    <>
      <Header />
      <main
        id="main"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <Hero />
        <Story />
        <Schedule />
        <Venue />
        <Attire />
        <RsvpFlow />
      </main>
      <Footer />
      <StickyRsvpBar />
    </>
  );
}
