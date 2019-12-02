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
    grade: string;
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

export interface MerchantDOHRatingData {
    camis: string;
    dba: string;
    boro: string;
    building: number;
    street: string;
    zipcode: number;
    phone: number;
    cuisine_description: string;
    inspection_date: string;
    action: string;
    violation_code: string;
    violation_description: string;
    critical_flag: string;
    score: number;
    grade: string;
    grade_date: string;
    record_date: string;
    inspection_type: string;
    latitude: number;
    longitude: number;
    community_board: number;
    council_district: number;
    census_tract: number;
    bin: number;
    bbl: number;
    nta: string;
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
    prod_name: string;
    amt: number;
    price: number;
    cnm: string;
    cid: string;
    client_id: string;
}

export interface PlateItemData {
    plateSize: string;
    plateNum: number;
    platePrice: number;
}

export interface CategoryData {
    client_id: string;
    cid: string;
    cval: string;
    visible?: boolean;
}

export interface SubCategoryData {
    scid: string;
    scval: string;
    sortOrder: number;
}


export interface MerchantLoginForm {
    mid?: string;
    mpw?: string;
    name?: string;
    animal?: string;
}

export interface UserLoginForm {
    uid?: string;
    upw?: string;
    confirm_upw?: string;
    name?: string;
    email?: string;
    confirm_email?: string;
}
