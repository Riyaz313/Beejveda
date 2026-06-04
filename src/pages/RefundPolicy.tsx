import React from "react";
import { Layout } from "@/components/layout/Layout";
import { RefreshCcw, CreditCard, CheckCircle } from "lucide-react";

const RefundPolicy: React.FC = () => {
  return (
    <Layout>
      <section className="bg-gradient-hero py-16">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Refund Policy
          </h1>
          <p className="max-w-2xl mx-auto text-primary-foreground/80 text-lg">
            Transparent refund guidelines for a smooth shopping experience.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="bg-card rounded-2xl shadow-sm p-8 md:p-10">

            <div className="flex items-center gap-3 mb-6">
              <RefreshCcw className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">Refund Eligibility</h2>
            </div>

            <ul className="list-disc pl-6 space-y-3 text-muted-foreground mb-8">
              <li>Damaged or defective products received.</li>
              <li>Incorrect item delivered.</li>
              <li>Order cancelled before shipment.</li>
              <li>Approved return requests under our Returns Policy.</li>
            </ul>

            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">Refund Process</h2>
            </div>

            <ol className="list-decimal pl-6 space-y-3 text-muted-foreground mb-8">
              <li>Submit a refund request with order details.</li>
              <li>Our support team reviews your request.</li>
              <li>Approved refunds are processed within 7–14 business days.</li>
              <li>Refunds are issued to the original payment method.</li>
            </ol>

            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">Refund Timeline</h2>
            </div>

            <p className="text-muted-foreground mb-8">
              Depending on your bank or payment provider, it may take additional
              time for the refunded amount to reflect in your account.
            </p>

            <div className="bg-secondary/30 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-2">
                Need Help?
              </h3>
              <p className="text-muted-foreground">
                Contact our support team at support@beejveda.com with your order
                number for assistance.
              </p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RefundPolicy;