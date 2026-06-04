import React from "react";
import { Layout } from "@/components/layout/Layout";
import { FileText, ShoppingBag, AlertCircle } from "lucide-react";

const TermsOfService: React.FC = () => {
  return (
    <Layout>
      <section className="bg-gradient-hero py-16">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="max-w-2xl mx-auto text-primary-foreground/80 text-lg">
            Please read these terms carefully before using our website and services.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="bg-card rounded-2xl shadow-sm p-8 md:p-10">

            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
            </div>

            <p className="text-muted-foreground mb-8">
              By accessing and using BeejVedaNaturals, you agree to comply with
              these Terms of Service and all applicable laws and regulations.
            </p>

            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">Orders & Payments</h2>
            </div>

            <ul className="list-disc pl-6 space-y-3 text-muted-foreground mb-8">
              <li>All prices are listed in INR unless otherwise specified.</li>
              <li>Orders are subject to availability.</li>
              <li>We reserve the right to cancel suspicious transactions.</li>
              <li>Payment must be completed before order processing.</li>
            </ul>

            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            </div>

            <p className="text-muted-foreground mb-8">
              We are not responsible for indirect, incidental, or consequential
              damages resulting from the use of our products or services.
            </p>

            <h2 className="text-2xl font-semibold mb-4">
              Intellectual Property
            </h2>

            <p className="text-muted-foreground mb-8">
              All website content including logos, images, text, and designs are
              the property of BeejVedaNaturals and may not be copied without permission.
            </p>

            <h2 className="text-2xl font-semibold mb-4">
              Changes to Terms
            </h2>

            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Updates
              will be posted on this page.
            </p>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsOfService;