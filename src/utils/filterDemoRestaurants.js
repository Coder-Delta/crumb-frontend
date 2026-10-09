import { demoMenu, demoRestaurants } from '../data/demoData.js';

function includesText(value, query) {
  return String(value || '')
    .toLowerCase()
    .includes(query);
}

export function filterDemoRestaurants({ search = '', filters = {} } = {}) {
  const query = search.trim().toLowerCase();
  let results = demoRestaurants.filter((restaurant) => {
    const menu = demoMenu.filter((item) => item.restaurant === restaurant._id);
    const matchesSearch =
      !query ||
      [
        restaurant.name,
        restaurant.description,
        ...restaurant.cuisine,
        ...(restaurant.tags || []),
      ].some((value) => includesText(value, query)) ||
      menu.some((item) => includesText(item.name, query));
    const matchesCategory =
      !filters.category ||
      filters.category === 'All' ||
      [...restaurant.cuisine, ...(restaurant.tags || [])].some((value) =>
        includesText(value, filters.category),
      ) ||
      menu.some((item) => includesText(item.category, filters.category));
    const matchesVegetarian = !filters.veg || (menu.length > 0 && menu.every((item) => item.veg));
    const matchesFeatured = !filters.promoted || restaurant.promoted;
    return matchesSearch && matchesCategory && matchesVegetarian && matchesFeatured;
  });

  if (filters.sort === 'rating') results.sort((a, b) => b.rating - a.rating);
  else if (filters.sort === 'delivery') {
    results.sort((a, b) => parseInt(a.deliveryTime, 10) - parseInt(b.deliveryTime, 10));
  } else if (filters.sort === 'price') results.sort((a, b) => a.priceForTwo - b.priceForTwo);
  else results.sort((a, b) => Number(b.promoted) - Number(a.promoted) || b.rating - a.rating);

  return results;
}
