
export interface IPlayer {
    id: number;
    name: string;
    money: number;
    rank: number;
    country: ICountry;
}

export interface ICountry {
    id: number;
    name: string;
    flag: string;
}

export interface IPlayerOption {
    id: number;
    name: string;
    country: ICountry;
}