import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero min-h-[90vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-leaf rounded-full blur-3xl" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[10%] animate-float">
          <Leaf className="w-8 h-8 text-primary-foreground/20" />
        </div>
        <div className="absolute top-1/3 right-[15%] animate-float stagger-2">
          <Sparkles className="w-6 h-6 text-gold/40" />
        </div>
        <div className="absolute bottom-1/4 left-[20%] animate-float stagger-3">
          <Leaf className="w-10 h-10 text-primary-foreground/15 rotate-45" />
        </div>
      </div>

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-primary-foreground text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full mb-6 animate-fade-up">
              <Leaf className="w-4 h-4 text-leaf" />
              <span className="text-sm font-medium">100% Organic & Natural</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 animate-fade-up stagger-1">
              BeejVeda<span className="text-leaf">Naturals</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal mt-2 text-primary-foreground/80">
                Pure Nutrition from Nature
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up stagger-2">
              Discover the power of organic microgreens, medicinal mushrooms, 
              herbal teas & superfoods. Where Ayurveda meets modern wellness.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up stagger-3">
              <Link to="/shop">
                <Button variant="gold" size="xl" className="w-full sm:w-auto group">
                  Shop Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/why-beejveda">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Explore Wellness
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-10 animate-fade-up stagger-4">
              <div className="text-center">
                <p className="text-2xl font-bold">5000+</p>
                <p className="text-sm text-primary-foreground/60">Happy Customers</p>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm text-primary-foreground/60">Organic</p>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">50+</p>
                <p className="text-sm text-primary-foreground/60">Products</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-up stagger-2">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative Ring */}
              <div className="absolute inset-0 border-2 border-primary-foreground/20 rounded-full animate-pulse-soft" />
              <div className="absolute inset-4 border border-primary-foreground/10 rounded-full" />
              
              {/* Main Image */}
              <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=600&fit=crop"
                  alt="Fresh organic microgreens and vegetables"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Product Cards */}
              <div className="absolute -left-4 top-1/4 bg-card text-card-foreground p-3 rounded-xl shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=100"
                      alt="Microgreens"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Microgreens</p>
                    <p className="text-xs text-muted-foreground">30x Nutrition</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-card text-card-foreground p-3 rounded-xl shadow-lg animate-float stagger-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=100"
                      alt="Mushrooms"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Mushrooms</p>
                    <p className="text-xs text-muted-foreground">Plant Protein</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
