import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import Price from "@/components/ui/Price";
import CategoryPills from "@/components/ui/CategoryPills";
import FeatureCard from "@/components/ui/FeatureCard";
import StatCard from "@/components/ui/StatCard";
import TestimonialCard from "@/components/ui/TestimonialCard";
import PromoBanner from "@/components/ui/PromoBanner";
import FAQItem from "@/components/ui/FAQItem";
import FormField from "@/components/ui/FormField";
import Notice from "@/components/ui/Notice";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BusinessHours from "@/components/ui/BusinessHours";
import ImageWithCaption from "@/components/ui/ImageWithCaption";

export const metadata = { title: "Component Library | FrontendForge", description: "Reusable frontend component catalogue and preview." };
export default function ComponentsPage() {
  return <main className="library-page"><Container>
    <header className="library-top"><a href="/">← FrontendForge</a><Badge>COMPONENT PLAYGROUND</Badge></header>
    <SectionHeading eyebrow="SHARED UI SYSTEM" title="Reusable building blocks" description="A visual catalogue of the shared components included in the starter system. Copy a usage pattern from docs/guides/COMPONENT-LIBRARY.md and customize it for each client."/>
    <section className="library-section"><h2>Buttons, badges and navigation</h2><div className="library-row"><Button>Primary action</Button><Button variant="secondary">Secondary action</Button><Button variant="outline">Outline action</Button><Badge>New collection</Badge></div><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Shop",href:"#shop"},{label:"Current page"}]}/></section>
    <section className="library-section"><h2>Category and price patterns</h2><CategoryPills categories={["All items","Clothing","Accessories","New arrivals"]} /><Price amount="ETB 1,450" note="/ item"/></section>
    <section className="library-section"><h2>Cards and feature blocks</h2><div className="library-grid three"><FeatureCard number="01" title="Responsive layout" description="A flexible layout that adapts to phones, tablets and desktop screens."/><FeatureCard number="02" title="Reusable UI" description="A shared component foundation for consistent pages and faster changes."/><FeatureCard number="03" title="Clear handoff" description="Documented setup and launch guidance for every client delivery."/></div></section>
    <section className="library-section"><h2>Stats and testimonials</h2><div className="library-grid three"><StatCard value="5" label="Website starters" note="Ecommerce and food businesses"/><StatCard value="20+" label="Shared components" note="Extend as client needs grow"/><StatCard value="1" label="Reusable foundation" note="Separate copy per client"/></div><div className="library-grid two"><TestimonialCard quote="Replace this sample with a real, approved customer testimonial. Never publish invented reviews." author="Client name" role="Verified customer · placeholder"/></div></section>
    <section className="library-section"><h2>Forms and notices</h2><Card className="library-form-card"><FormField label="Your name" name="demo-name" placeholder="Enter a name" required/><FormField label="Email address" name="demo-email" type="email" placeholder="name@example.com" hint="Use a real email validation and submission flow in production."/><Button type="button">Demo form button</Button></Card><Notice title="Demo-only behavior" tone="warning">This component preview does not submit data. Connect forms to an API or trusted form provider before collecting real customer details.</Notice></section>
    <section className="library-section"><h2>Promo, FAQ and business information</h2><PromoBanner eyebrow="A LITTLE SOMETHING EXTRA" title="Create a reason to come back" description="Promote a seasonal range, offer or new service here." cta="Explore offer" href="/templates/ecommerce"/><div className="library-grid two"><div><FAQItem question="Can I reuse these components across projects?" answer="Yes. Duplicate the master project and adapt the shared components where the change is broadly reusable." open/><FAQItem question="Does the cart process real payments?" answer="No. The current cart stores demo items in browser localStorage only. Connect a real checkout provider for live transactions."/></div><BusinessHours rows={[{day:"Monday – Friday",hours:"8:00 AM – 6:00 PM"},{day:"Saturday",hours:"9:00 AM – 4:00 PM"},{day:"Sunday",hours:"Closed"}]}/></div><ImageWithCaption src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=85" alt="Coffee on a wooden cafe table" caption="Image and caption component — swap in properly licensed client imagery."/></section>
    <footer className="library-bottom"><a href="/">Back to starter library ↑</a><span>FrontendForge · Shared UI components</span></footer>
  </Container></main>;
}