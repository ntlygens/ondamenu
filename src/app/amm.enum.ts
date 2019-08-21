export enum AmmStateType {
  INTRO = 'intro' as any,
  MERCHANT = 'merchant' as any,
  USER = 'user' as any,
  CLIENT = 'client' as any,
}
export enum LocSrveType {
    FASTFOOD = 'fast-food' as any,
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
    bio?: string;
    price?: string;
    phone: string;
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
    prep?: {
        vegan: boolean;
        vegetarian: boolean;
        pescatarian: boolean;
        kosher: boolean;
        halal: boolean;
    };
    delivery: boolean;
    type: LocSrveType;
    status: LocSrvcStatus;
}
