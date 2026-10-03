import Header from "@/components/Header";
import SpecialOfferBanner from "@/components/SpecialOfferBanner";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import BookingSection from "@/components/BookingSection";
import BookingLauncher from "@/components/BookingLauncher";
import PriceList from "@/components/PriceList";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

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
