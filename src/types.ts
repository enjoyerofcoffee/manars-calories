export type MealRow = {
  id: string;
  meal_name: string;
  meal_calories: number;
  time?: Date;
};

export type Meal = {
  id: string;
  name: string;
  calories: number;
  time?: Date | null;
};