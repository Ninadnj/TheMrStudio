import Header from "@/components/Header";
import SpecialOfferBanner from "@/components/SpecialOfferBanner";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import NailShapeQuiz from "@/components/NailShapeQuiz";
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
      {/* Interactive Quiz (2025 Design Brief) */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <NailShapeQuiz />
      </section>
      <Gallery />
      <PriceList />
      <BookingForm />
      <Footer />
      {/* <ChatWidget /> */}
    </div>
  );
}
