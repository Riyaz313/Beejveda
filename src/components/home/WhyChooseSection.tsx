import { Leaf, Award, Truck, Shield, FlaskConical, Heart } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "100% Organic",
    description: "All products are grown without pesticides or chemicals. Pure nutrition, straight from nature.",
  },
  {
    icon: FlaskConical,
    title: "Lab Tested",
    description: "Every batch is rigorously tested for quality, purity, and nutritional content.",
  },
  {
    icon: Award,
    title: "FSSAI Certified",
    description: "Fully compliant with food safety standards. Export quality processing.",
  },
  {
    icon: Heart,
    title: "Ayurveda + Science",
    description: "Traditional Ayurvedic wisdom combined with modern nutritional science.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Fresh products delivered to your doorstep. Free shipping on orders above ₹999.",
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Not satisfied? Get a full refund. We stand behind every product we sell.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="py-20 bg-secondary/30 leaf-pattern">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-leaf font-medium text-sm uppercase tracking-wider">
            Our Promise
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Why Choose BeejVedaNaturals?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to bringing you the purest, most nutritious organic products. 
            Here's what makes us different.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card p-6 rounded-2xl shadow-sm card-hover animate-fade-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
