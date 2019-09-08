export enum AmmStateType {
  INTRO = 'intro' as any,
  MERCHANT = 'merchant' as any,
  USER = 'user' as any,
  CLIENT = 'client' as any,
}

export enum LocSrvcType {
    FASTFOOD = 'fast-food' as any,
    FOODTRUCK = 'food-truck' as any,
    EATIN = 'eat-in' as any,
    OUTDOOR = 'outdoor' as any,
    LOUNGE = 'lounge' as any,
    BAR = 'bar' as any
}

export enum LocSrvcStatus {
    OPEN = 'open' as any,
    CLOSED = 'closed' as any
}

export enum LocFoodType {
    VEGAN = 'vegan' as any,
    VEGETARIAN = 'vegetarian' as any,
    PESCATARIAN = 'pescatarian' as any,
    ETHNIC = 'ethnic' as any,
    AMERICAN = 'american' as any,
}

export interface AmmRouteInterface {
  title?: string;
  redirectTo?: string;
  loadChildren?: string;
  pathMatch?: string;
  path: string;
  component?: any;
  data?: {
      state: string;
      animation: string;
  };
  children?: any;
  outlets?: any;
  outlet?: string;
  formType?: AmmStateType;
}

export interface MerchantInfoData {
    client_id: string;
    logo?: string;
    username: string;
    slogan?: string;
    phone: string;
    bio?: string;
    price?: string;
    address: string;
    state: string;
    zip: number;
    /*contact: {
      email?: string;
      phone: string;
      address: {
        street: string;
        city: string;
        state: string;
        zip: string;
      };
    };*/
    delivery: boolean;
    concept?: LocSrvcType;
    status?: LocSrvcStatus;
    food?: LocFoodType;
}

export interface MerchantDOHRating {
    rating: string;
}

export interface CategoryProductsData {
    pid: string;
    prod_name: string;
    alternateName: string;
    price: number;
    priceType: string;
    src: string;
    cid: string;
    client_id: string;

}

export interface CartItemData {
    pid: string;
    amt: number;
}
