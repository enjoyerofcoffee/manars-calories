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

export type Notes = {
  id: string;
  text: string;
  time: Date | null;
};

export type NotesRow = {
  id: string;
  text: string;
  time: Date | null;
};

export type FoodInformation = {
  id: string;
  name: string;
  notes: string;
};
