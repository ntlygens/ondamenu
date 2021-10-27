export enum MerchantType {
    FASTFOOD = 'fast-food',
    EATIN = 'eat-in',
    OUTDOOR = 'outdoor',
    LOUNGE = 'lounge',
    BAR = 'bar'
}


export enum MerchantStatus {
    OPEN = 'open',
    CLOSED = 'closed'
}

export interface MerchantInterfaceTile {
    color: string;
    cols: number;
    rows: number;
    text: string;
    display: string;
    img?: string;
    href?: string;
    activeCell: boolean;
    logo?: boolean;
}

export interface MerchantInfo {
    name: string;
    logo: string;
    slogan?: string;
    desc: string;
    contact: {
        email?: string;
        phone: string;
        address: {
            street: string;
            city: string;
            state: string;
            zip: string;
        };
    };
    prep?: {
        vegan: boolean;
        vegetarian: boolean;
        pescatarian: boolean;
        kosher: boolean;
        halal: boolean;
    };
    type: MerchantType;
    status: MerchantStatus;
}

export interface MerchantCatProducts {
    id: string;
    hidden: boolean;
    name: string;
    price: number;
    categories?: {
        elements: MerchantProductCats[]
    };

}

export interface LocalMerchantCatProducts {
    client_id: string;
    src: string;
    prod_id: string;
    prod_name: string;
    price: number;
    stockCount: number;
    hidden: boolean;
    cval: string;

}

export interface MerchantProductCats {
    sortOrder: number;
    name: string;
    id: string;

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


