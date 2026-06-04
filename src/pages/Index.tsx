import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { WellnessPacksSection } from "@/components/home/WellnessPacksSection";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CertificationsSection } from "@/components/home/CertificationsSection";
import { BlogSection } from "@/components/home/BlogSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategoriesSection />
      <BestSellersSection />
      {/* <WellnessPacksSection /> */}
      <WhyChooseSection />
      <TestimonialsSection />
      <CertificationsSection />
      <BlogSection />
    </Layout>
  );
};

export default Index;
