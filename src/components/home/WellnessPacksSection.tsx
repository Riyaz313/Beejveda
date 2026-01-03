import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { bundles } from "@/data/products";
import { ShoppingCart, Gift, ArrowRight } from "lucide-react";

export function WellnessPacksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-leaf font-medium text-sm uppercase tracking-wider">
            Value Bundles
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Wellness Packs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated product combinations designed for specific wellness goals. 
            Save more with our thoughtfully crafted bundles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {bundles.map((bundle, index) => (
            <div
              key={bundle.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm card-hover animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={bundle.image}
                  alt={bundle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-gold text-primary-foreground px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  {bundle.savings}
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display font-bold text-primary-foreground text-xl mb-1">
                    {bundle.name}
                  </h3>
                  <p className="text-primary-foreground/80 text-sm">
                    {bundle.description}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Products Included */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Includes:
                  </p>
                  <ul className="space-y-1">
                    {bundle.products.map((product, i) => (
                      <li key={i} className="text-sm text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-leaf" />
                        {product}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-foreground">
                    ₹{bundle.price}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{bundle.originalPrice}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Link to={`/bundle/${bundle.slug}`}>
                    <Button variant="outline" size="icon">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
