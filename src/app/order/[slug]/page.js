import { notFound } from "next/navigation";
import FoodBusinessExperience from "@/components/food/FoodBusinessExperience";
import { foodBusinesses, foodBusinessBySlug } from "@/config/food-businesses";

export function generateStaticParams() {
  return foodBusinesses.map((business) => ({ slug: business.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const business = foodBusinessBySlug[slug];
  if (!business) return { title: "Food ordering demo" };
  return { title: `${business.name} | Order online`, description: business.intro };
}

export default async function FoodOrderPage({ params }) {
  const { slug } = await params;
  const business = foodBusinessBySlug[slug];
  if (!business) notFound();
  return <FoodBusinessExperience business={business} />;
}
