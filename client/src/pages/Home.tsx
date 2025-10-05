import Header from "@/components/Header";
import SpecialOfferBanner from "@/components/SpecialOfferBanner";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import BookingForm from "@/components/BookingForm";
import PriceList from "@/components/PriceList";
import Footer from "@/components/Footer";
// import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SpecialOfferBanner />
      <Header />
      <Hero />
      <Services />
      <Gallery />
      <PriceList />
      <BookingForm />
      <Footer />
      {/* <ChatWidget /> */}
    </div>
  );
}
