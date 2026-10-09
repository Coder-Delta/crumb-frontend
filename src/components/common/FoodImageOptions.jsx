import { foodImagePaths } from '../../data/foodImages.js';

export const FOOD_IMAGE_LIST_ID = 'crumb-food-image-library';

export default function FoodImageOptions() {
  return (
    <datalist id={FOOD_IMAGE_LIST_ID}>
      {foodImagePaths.map((path, index) => (
        <option key={path} value={path} label={`Food photo ${index + 1}`} />
      ))}
    </datalist>
  );
}
