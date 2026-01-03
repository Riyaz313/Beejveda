import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  // For demo, cart is empty
  const cartItems: any[] = [];

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-4xl">
          <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any products yet. Start exploring our organic collection!
              </p>
              <Link to="/shop">
                <Button size="lg" className="group">
                  Continue Shopping
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {/* Cart items would go here */}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
