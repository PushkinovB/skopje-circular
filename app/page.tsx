import { FeatureStrip } from "@/components/feature-strip";
import { HomeIntro } from "@/components/home-intro";
import { HomePath } from "@/components/home-path";

export default function HomePage() {
  return (
    <>
      <HomeIntro />
      <FeatureStrip />
      <HomePath />
    </>
  );
}
