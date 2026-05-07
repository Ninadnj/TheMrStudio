import Header from "@/components/Header";
import SpecialOfferBanner from "@/components/SpecialOfferBanner";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import TrendsSection from "@/components/TrendsSection";
import Gallery from "@/components/Gallery";
import BookingForm from "@/components/BookingForm";
import PriceList from "@/components/PriceList";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import InstallPrompt from "@/components/InstallPrompt";
// import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div id="home" className="min-h-screen overflow-x-hidden md:pb-0 pb-tabbar">
      <SpecialOfferBanner />
      <Header />
      <Hero />
      <Services />
      {/* What's Trendy Now Section */}
      <TrendsSection />
      <Gallery />
      <PriceList />
      <BookingForm />
      <Footer />
      <MobileBottomNav />
      <InstallPrompt />
      {/* <ChatWidget /> */}
    </div>
  );
}
