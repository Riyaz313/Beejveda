import { Award, Leaf, Globe, ShieldCheck } from "lucide-react";

const certifications = [
  {
    icon: Award,
    name: "FSSAI Certified",
    description: "Food Safety Standards Authority of India",
  },
  {
    icon: Leaf,
    name: "100% Organic",
    description: "Certified organic farming practices",
  },
  {
    icon: Globe,
    name: "Export Quality",
    description: "International quality standards",
  },
  {
    icon: ShieldCheck,
    name: "Lab Tested",
    description: "Third-party quality verification",
  },
];

export function CertificationsSection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Trusted Quality Certifications
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <div
              key={cert.name}
              className="text-center p-6 rounded-2xl bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-colors animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <cert.icon className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">
                {cert.name}
              </h3>
              <p className="text-sm text-primary-foreground/70">
                {cert.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
