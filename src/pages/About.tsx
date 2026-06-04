import { Layout } from "@/components/layout/Layout";
import { Leaf, Users, Award, Heart, Target, Globe } from "lucide-react";
import BeejvedaImage from "@/assets/BeejvedaImage.png";

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            About BeejVedaNaturals
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Bringing the purest organic nutrition from nature to your table. 
            Where ancient Ayurvedic wisdom meets modern wellness.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-leaf font-medium text-sm uppercase tracking-wider">
                Our Story
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                From Farm to Your Table
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  BeejVedaNaturals was born from a simple belief: that nature provides everything 
                  we need for optimal health. Our journey began when we discovered the incredible 
                  nutritional density of microgreens – just 7 days of growth equals 30 days of 
                  regular vegetable nutrition.
                </p>
                <p>
                  Today, we're proud to bring you a curated selection of organic superfoods, 
                  medicinal mushrooms, herbal teas, and farm-fresh microgreens. Every product 
                  is carefully sourced from trusted organic farms and processed with the highest 
                  quality standards.
                </p>
                <p>
                  Our mission is to make pure, unadulterated nutrition accessible to everyone. 
                  We believe in the power of plants, the wisdom of Ayurveda, and the potential 
                  of modern science to transform health.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                // src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=500&fit=crop"
                src={BeejvedaImage}
                alt="Organic farming"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-hero flex items-center justify-center">
                    <Leaf className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-2xl text-foreground">100%</p>
                    <p className="text-sm text-muted-foreground">Chemical Free</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-leaf font-medium text-sm uppercase tracking-wider">
              What We Stand For
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
              Our Core Values
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Leaf,
                title: "Pure & Natural",
                description: "No chemicals, no pesticides, no artificial additives. Just nature's goodness in its purest form."
              },
              {
                icon: Heart,
                title: "Health First",
                description: "Every product is designed with your wellness in mind. We prioritize nutrition over everything else."
              },
              {
                icon: Users,
                title: "Community",
                description: "We support local farmers and sustainable farming practices that benefit communities."
              },
              {
                icon: Award,
                title: "Quality Assured",
                description: "Lab-tested, FSSAI certified, and export-quality standards for every product we sell."
              },
              {
                icon: Target,
                title: "Innovation",
                description: "Combining traditional Ayurvedic wisdom with modern nutritional science for optimal results."
              },
              {
                icon: Globe,
                title: "Sustainability",
                description: "Eco-friendly packaging and practices that respect our planet and future generations."
              }
            ].map((value, index) => (
              <div
                key={value.title}
                className="bg-card p-6 rounded-2xl shadow-sm card-hover animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5000+", label: "Happy Customers" },
              { value: "50+", label: "Organic Products" },
              { value: "100%", label: "Natural Ingredients" },
              { value: "15+", label: "Partner Farms" }
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-primary-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
