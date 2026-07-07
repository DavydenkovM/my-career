import { CvClient } from "@/components/CvClient";
import { getExperience } from "@/content/loader";

export default function HomePage() {
  const items = {
    ru: getExperience("ru"),
    en: getExperience("en"),
  };
  return <CvClient items={items} />;
}
