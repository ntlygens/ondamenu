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

export enum LocSrvcModel {
    BUFFET = 'Buffet',
    PREFIXED = 'PreFixed',
    DEFINED = 'Defined',
    UNDEFINED = 'Undefined'
}

export enum LocSrvcCuisine {
    ETHNIC = 'Ethnic',
    AMERICAN = 'American',
    ITALIAN = 'Italian',
    FRENCH = 'French',
    INDIAN = 'Indian',
    GREEK = 'Greek',
    AFRICAN = 'African',
    CARIBBEAN = 'Caribbean',
    MEDITERRANEAN = 'Mediterranean',
    OTHER = 'Other',
}

export enum LocSrvcDining {
    FAST_FOOD = 'Fast Food',
    FAST_CASUAL = 'Fast Casual',
    CASUAL_DINING = 'Casual Dining',
    PREMIUM_CASUAL = 'Premium Casual',
    FAMILY_DINING = 'Family Dining',
    FINE_DINING = 'Fine Dining',
    CAFE_BISTRO = 'Cafe / Bistro',
    BUFFET = 'Buffet',
    POPUP = 'PopUp',
}

export enum LocSrvcRstrctns {
    VEGAN = 'vegan',
    VEGETARIAN = 'vegetarian',
    PESCATARIAN = 'pescatarian',
    ETHNIC = 'ethnic',
    AMERICAN = 'american',
}


export interface AmmRouteInterface {
  title?: string;
  redirectTo?: string;
  loadChildren?: any;
  pathMatch?: string;
  path: string;
  component?: any;
  data?: {
      state: string;
      animation: string;
      mobile?: any;
  };
  children?: any;
  outlets?: any;
  outlet?: string;
  formType?: AmmStateType;
}

export interface MerchantInfoData {
    client_id: string;
    username: string;
    email: string;
    pkgd_food: number;
    prepd_food: number;
    fish: number;
    meat: number;
    halal: number;
    kosher: number;
    temp: number;
    grade?: string;
    logo: string;
    location: string;
    promo?: string;
    banner?: string;
    employee_id: string;
    slogan?: string;
    bio?: string;
    bldg_num: string;
    address: string;
    address2: string;
    boro: string;
    state: string;
    zip: string;
    latitude?: string;
    longitude?: string;
    phone: string;
    pos_sys: string;
    food?: LocSrvcCuisine;
    concept?: LocSrvcDining;
    model?: LocSrvcModel;
    restrictions?: LocSrvcRstrctns;
    delivery?: string;
    shipping: string;
    loc_status?: LocSrvcStatus;

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
    latitude: string;
    longitude: string;
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

export interface PaymentResponseData {
    authCode?: string;
    failureMessage?: string;
    token?: string;
    result: string;
    avsResult?: string;
    paymentId: string;
    cvvResult?: string;
}
