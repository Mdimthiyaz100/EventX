import ExploreEvents from "./ExploreEvents";

interface CategoryPageProps {
  categoryName?: string;
}

export default function CategoryPresetPage({ categoryName }: CategoryPageProps) {
  return <ExploreEvents initialCategoryPreset={categoryName} />;
}
