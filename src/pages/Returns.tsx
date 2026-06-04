import React from "react";
import { Layout } from "@/components/layout/Layout";

const Returns: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Returns & Refunds
          </h1>
          <p className="max-w-2xl mx-auto text-primary-foreground/80 text-lg">
            Your satisfaction is important to us. Please review our return and
            refund policy below.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="bg-card rounded-2xl shadow-sm p-8 md:p-10">
            <p className="mb-6 text-muted-foreground">
              We want you to be completely satisfied with your purchase. If
              you're not happy with your order, you may request a return within
              15 days of delivery, subject to the conditions below.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Return Conditions
            </h2>

            <ul className="list-disc pl-6 space-y-3 text-muted-foreground mb-8">
              <li>
                Items must be unused, unopened, and in their original packaging.
              </li>
              <li>
                Products should be in resalable condition at the time of return.
              </li>
              <li>
                Perishable items, opened products, and customized orders may not
                be eligible for return.
              </li>
              <li>
                A valid proof of purchase or order number is required.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              How to Return an Item
            </h2>

            <ol className="list-decimal pl-6 space-y-3 text-muted-foreground mb-8">
              <li>
                Contact our support team with your order details.
              </li>
              <li>
                Wait for return authorization and shipping instructions.
              </li>
              <li>
                Pack the item securely and ship it to the provided address.
              </li>
              <li>
                Retain the shipment tracking number until the return is
                completed.
              </li>
            </ol>

            <div className="bg-secondary/30 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-lg mb-2">
                Contact for Returns
              </h3>
              <p className="text-muted-foreground">
                Email: <strong>support@beejveda.com</strong>
              </p>
              <p className="text-muted-foreground">
                Please include your order number and reason for return.
              </p>
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Refund Policy
            </h2>

            <p className="text-muted-foreground mb-4">
              Once we receive and inspect the returned item, we will notify you
              about the status of your refund.
            </p>

            <p className="text-muted-foreground">
              Approved refunds will be processed to the original payment method
              within <strong>7–14 business days</strong>. Processing times may
              vary depending on your bank or payment provider.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Returns;