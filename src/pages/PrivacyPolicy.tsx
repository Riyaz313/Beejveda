import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Shield, Lock, Eye } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout>
      <section className="bg-gradient-hero py-16">
        <div className="container text-center text-primary-foreground">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="max-w-2xl mx-auto text-primary-foreground/80 text-lg">
            Your privacy is important to us. Learn how we collect, use, and
            protect your information.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="bg-card rounded-2xl shadow-sm p-8 md:p-10">

            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">Information We Collect</h2>
            </div>

            <p className="text-muted-foreground mb-6">
              We may collect personal information such as your name, email
              address, phone number, shipping address, and payment details when
              you place an order or create an account.
            </p>

            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">How We Use Information</h2>
            </div>

            <ul className="list-disc pl-6 space-y-3 text-muted-foreground mb-8">
              <li>Process and fulfill orders.</li>
              <li>Provide customer support.</li>
              <li>Improve products and website experience.</li>
              <li>Send order updates and promotional offers.</li>
              <li>Comply with legal requirements.</li>
            </ul>

            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-8 h-8 text-leaf" />
              <h2 className="text-2xl font-semibold">Data Protection</h2>
            </div>

            <p className="text-muted-foreground mb-8">
              We implement industry-standard security measures to protect your
              personal information from unauthorized access, disclosure, or misuse.
            </p>

            <h2 className="text-2xl font-semibold mb-4">
              Third-Party Services
            </h2>

            <p className="text-muted-foreground mb-8">
              We may use trusted third-party providers for payment processing,
              analytics, and shipping. These providers only access information
              necessary to perform their services.
            </p>

            <h2 className="text-2xl font-semibold mb-4">
              Contact Us
            </h2>

            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us
              at support@beejveda.com.
            </p>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;