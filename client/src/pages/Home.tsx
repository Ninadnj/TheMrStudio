import BookingLauncher from "@/components/BookingLauncher";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MobileBottomNav from "@/components/MobileBottomNav";
import PriceList from "@/components/PriceList";
import Services from "@/components/Services";
import SpecialOfferBanner from "@/components/SpecialOfferBanner";

export default function Home() {
  return (
    <div id="home" className="min-h-screen overflow-x-clip md:pb-0 pb-tabbar">
      <SpecialOfferBanner />
      <Header />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <PriceList />
        <BookingSection />
      </main>
      <Footer />
      {/* The only floating element on phones */}
      <MobileBottomNav />
      <BookingLauncher />
    </div>
  );
}
