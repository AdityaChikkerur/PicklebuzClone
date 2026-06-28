import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { CityLandingPage } from "@/components/marketing";
import {
  buildPageMetadata,
  breadcrumbJsonLd,
  CITY_PAGES,
  getCityPageBySlug,
  localBusinessPageJsonLd,
} from "@/lib/seo";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CITY_PAGES.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityPageBySlug(slug);
  if (!city) return {};

  return buildPageMetadata({
    title: city.headline,
    description: city.intro,
    path: city.path,
    keywords: city.keywords,
  });
}

export default async function CitySeoPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = getCityPageBySlug(slug);
  if (!city) notFound();

  return (
    <>
      <JsonLd
        data={[
          localBusinessPageJsonLd(city.city, city.path),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: `Pickleball in ${city.city}`, path: city.path },
          ]),
        ]}
      />
      <CityLandingPage city={city} />
    </>
  );
}
