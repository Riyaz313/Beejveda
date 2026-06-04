import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Truck, Clock, MapPin, Package } from "lucide-react";

const ShippingInfo: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Shipping Information
          </h1>
          <p className="max-w-2xl mx-auto text-primary-foreground/80 text-lg">
            Fast, reliable, and secure delivery of fresh natural products right
            to your doorstep.
          </p>
        </div>
      </section>

      {/* Shipping Details */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="bg-card rounded-2xl shadow-sm p-8 md:p-10">
            <p className="text-muted-foreground mb-8">
              At BeejVedaNaturals, we strive to ensure that your order reaches
              you in perfect condition. Most orders are processed within
              <strong> 1–2 business days</strong> and shipped through trusted
              delivery partners.
            </p>

            {/* Shipping Methods */}
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Shipping Methods & Delivery Times
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-secondary/30 p-6 rounded-xl">
                <Truck className="w-10 h-10 text-leaf mb-4" />
                <h3 className="font-semibold text-lg mb-2">Standard Shipping</h3>
                <p className="text-muted-foreground">
                  Typically delivered within 5–7 business days.
                </p>
              </div>

              <div className="bg-secondary/30 p-6 rounded-xl">
                <Clock className="w-10 h-10 text-leaf mb-4" />
                <h3 className="font-semibold text-lg mb-2">Express Shipping</h3>
                <p className="text-muted-foreground">
                  Delivered within 2–3 business days where available.
                </p>
              </div>

              <div className="bg-secondary/30 p-6 rounded-xl">
                <MapPin className="w-10 h-10 text-leaf mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  International Shipping
                </h3>
                <p className="text-muted-foreground">
                  Delivery timelines vary based on destination and customs
                  clearance.
                </p>
              </div>
            </div>

            {/* Rates */}
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Shipping Charges
            </h2>

            <div className="bg-secondary/20 rounded-xl p-6 mb-8">
              <p className="text-muted-foreground">
                Shipping rates are calculated automatically during checkout
                based on your delivery location and order weight.
              </p>

              <p className="mt-3 font-medium text-foreground">
                🚚 Free standard shipping on eligible orders above ₹999.
              </p>
            </div>

            {/* Tracking */}
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Order Tracking
            </h2>

            <div className="flex items-start gap-4 bg-secondary/20 rounded-xl p-6 mb-8">
              <Package className="w-10 h-10 text-leaf flex-shrink-0" />
              <div>
                <p className="text-muted-foreground">
                  Once your order has been shipped, you will receive a
                  confirmation email and/or SMS containing your tracking number
                  and a tracking link.
                </p>
              </div>
            </div>

            {/* Important Notes */}
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Important Notes
            </h2>

            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
              <li>
                Delivery times may vary during festivals, public holidays, or
                unforeseen circumstances.
              </li>
              <li>
                Fresh products are packed carefully to maintain quality during
                transit.
              </li>
              <li>
                Please ensure that your shipping address and contact details are
                accurate while placing the order.
              </li>
              <li>
                Orders cannot be redirected once shipped.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ShippingInfo;