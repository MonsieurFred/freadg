export type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'nut_free'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type MealType = 'lunch' | 'dinner'
export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due'
export type GroceryCategory =
  | 'légumes'
  | 'fruits'
  | 'viandes'
  | 'poissons'
  | 'produits laitiers'
  | 'épicerie'
  | 'surgelés'
  | 'boissons'
  | 'boulangerie'
  | 'autre'

export type RecipeStep = {
  step: number
  instruction: string
}

// ---- Row types (as returned by Supabase) ----

export type UserProfile = {
  id: string
  email: string
  household_size: number
  dietary_preferences: string[]
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  created_at: string
}

export type Recipe = {
  id: string
  title: string
  description: string
  photo_url: string | null
  prep_time_minutes: number
  servings_base: number
  tags: string[]
  season: string[]
  calories: number | null
  proteins_g: number | null
  carbs_g: number | null
  fats_g: number | null
  steps: RecipeStep[]
  is_active: boolean
  created_at: string
}

export type Ingredient = {
  id: string
  recipe_id: string
  name: string
  quantity: number
  unit: string
  grocery_category: string
}

export type RecipeWithIngredients = Recipe & {
  ingredients: Ingredient[]
}

export type WeeklySelection = {
  id: string
  week_start_date: string
  recipe_id: string
  recipe?: Recipe
}

export type UserMealPlan = {
  id: string
  user_id: string
  week_start_date: string
  day_of_week: number
  meal_type: string
  recipe_id: string
  recipe?: Recipe
}

export type UserFavorite = {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
  recipe?: Recipe
}

export type ShoppingListItem = {
  name: string
  quantity: number
  unit: string
  grocery_category: string
}

export type ShoppingList = {
  [category: string]: ShoppingListItem[]
}

// ---- Supabase Database type ----

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          household_size: number
          dietary_preferences: string[]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          household_size?: number
          dietary_preferences?: string[]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          household_size?: number
          dietary_preferences?: string[]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          created_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string
          photo_url: string | null
          prep_time_minutes: number
          servings_base: number
          tags: string[]
          season: string[]
          calories: number | null
          proteins_g: number | null
          carbs_g: number | null
          fats_g: number | null
          steps: RecipeStep[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          photo_url?: string | null
          prep_time_minutes?: number
          servings_base?: number
          tags?: string[]
          season?: string[]
          calories?: number | null
          proteins_g?: number | null
          carbs_g?: number | null
          fats_g?: number | null
          steps?: RecipeStep[]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          photo_url?: string | null
          prep_time_minutes?: number
          servings_base?: number
          tags?: string[]
          season?: string[]
          calories?: number | null
          proteins_g?: number | null
          carbs_g?: number | null
          fats_g?: number | null
          steps?: RecipeStep[]
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          id: string
          recipe_id: string
          name: string
          quantity: number
          unit: string
          grocery_category: string
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          quantity: number
          unit: string
          grocery_category?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          quantity?: number
          unit?: string
          grocery_category?: string
        }
        Relationships: []
      }
      weekly_selection: {
        Row: {
          id: string
          week_start_date: string
          recipe_id: string
        }
        Insert: {
          id?: string
          week_start_date: string
          recipe_id: string
        }
        Update: {
          id?: string
          week_start_date?: string
          recipe_id?: string
        }
        Relationships: []
      }
      user_meal_plans: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          day_of_week: number
          meal_type: string
          recipe_id: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          day_of_week: number
          meal_type: string
          recipe_id: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          day_of_week?: number
          meal_type?: string
          recipe_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_shopping_list: {
        Args: { p_user_id: string; p_week_start: string }
        Returns: Array<{
          ingredient_name: string
          total_quantity: number
          unit: string
          grocery_category: string
        }>
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
