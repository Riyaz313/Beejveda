import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Sprout, 
  FlaskConical, 
  Leaf, 
  Shield, 
  Zap, 
  Heart,
  ArrowRight,
  Check
} from "lucide-react";

export default function WhyBeejVeda() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Why BeejVedaNaturals?
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Discover what makes our organic products truly exceptional. 
            Science-backed nutrition meets traditional Ayurvedic wisdom.
          </p>
        </div>
      </section>

      {/* Microgreens Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-6 h-6 text-leaf" />
                <span className="text-leaf font-medium text-sm uppercase tracking-wider">
                  Microgreens Magic
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                7 Days of Microgreens = 30 Days of Vegetables
              </h2>
              <p className="text-muted-foreground mb-6">
                Scientific research has proven that microgreens contain up to 40 times more 
                nutrients than their mature counterparts. In just 7-14 days of growth, these 
                tiny powerhouses pack more vitamins, minerals, and antioxidants than 30 days 
                worth of regular vegetables.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "4-40x more vitamins than mature plants",
                  "Rich in enzymes and phytonutrients",
                  "Complete amino acid profile",
                  "High chlorophyll content for detox",
                  "Easy to digest and absorb"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-leaf shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/category/microgreens">
                <Button size="lg" className="group">
                  Shop Microgreens
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&h=500&fit=crop"
                alt="Fresh microgreens"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mushrooms Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=600&h=500&fit=crop"
                alt="Medicinal mushrooms"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-6 h-6 text-leaf" />
                <span className="text-leaf font-medium text-sm uppercase tracking-wider">
                  Medicinal Mushrooms
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Plant-Based Protein Powerhouses
              </h2>
              <p className="text-muted-foreground mb-6">
                Mushrooms are nature's answer to complete nutrition. They're one of the few 
                plant sources of Vitamin D, contain all essential amino acids, and are packed 
                with compounds that support immunity, brain function, and overall vitality.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Complete plant-based protein source",
                  "Natural source of Vitamin D",
                  "Adaptogenic properties for stress",
                  "Beta-glucans for immune support",
                  "Low calorie, high nutrient density"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-leaf shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/category/mushrooms">
                <Button size="lg" className="group">
                  Shop Mushrooms
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-leaf font-medium text-sm uppercase tracking-wider">
              Our Process
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              From Seed to Superfood
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every step of our process is designed to preserve maximum nutrition 
              while ensuring the highest quality standards.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Leaf,
                step: "01",
                title: "Chemical-Free Farming",
                description: "Organic seeds grown without pesticides, herbicides, or synthetic fertilizers."
              },
              {
                icon: Zap,
                step: "02",
                title: "Optimal Harvesting",
                description: "Harvested at peak nutrition to capture maximum vitamins and enzymes."
              },
              {
                icon: Shield,
                step: "03",
                title: "Quality Processing",
                description: "Low-temperature processing to preserve nutrients and freshness."
              },
              {
                icon: Heart,
                step: "04",
                title: "Fresh Delivery",
                description: "Carefully packaged and delivered fresh to your doorstep."
              }
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative bg-card p-6 rounded-2xl shadow-sm text-center animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {item.step}
                </div>
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-hero flex items-center justify-center mt-4 mb-4">
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of customers who have discovered the power of pure, 
            organic nutrition with BeejVedaNaturals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button variant="gold" size="xl" className="group">
                Shop Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="xl">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
