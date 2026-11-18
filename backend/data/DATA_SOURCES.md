# NutriFit Nutritional Data Sources

## 1. Primary Nutritional References
- **Indian Food Composition Tables (IFCT 2017)**: National Institute of Nutrition (NIN), Indian Council of Medical Research (ICMR). Primary data source for staple Indian pulses, cereals, dairy items, and regional recipes.
- **USDA FoodData Central**: Standard Reference Legacy and Foundation Foods database for standard fruits, vegetables, cuts of poultry, eggs, and processed snack items.
- **Curated Culinary Estimates**: Standardized preparation models for common cooked Indian preparations (e.g., Dal Makhani, Sambar, Sabzis, Street Foods) based on typical recipe yields and nutritional breakdowns.

## 2. Serving Units & Standard Density Guidelines
- Standard Indian Cup: 240 mL (liquids / gravies)
- Standard Katori: 150 mL (pulses / vegetable curries)
- Medium Roti / Chapati: ~30 grams cooked whole wheat dough
- Cooked Rice per cup: ~180 grams
- Medium Egg: ~55 grams boiled

## 3. Calculation Integrity
All nutrient mathematics are calculated deterministically via python:
$$\text{Nutrient} = \frac{\text{Grams} \times \text{Nutrient per 100g}}{100}$$
Missing nutrients are preserved as `NULL` rather than imputed to `0`.
