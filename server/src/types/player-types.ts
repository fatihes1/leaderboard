import {z} from "zod";

export interface PlayerScore {
    id: number;
    name: string;
    country: string;
    money: string;
}

export interface PlayerOptionResponse {
    suggestions: PlayerOption[];
}

export interface PlayerOption {
    id: number;
    name: string;
    country: object;
}

export const playerSchema = z.object({
    id: z.number(),
    name: z.string(),
    country: z.string(),
});

export type Player = z.infer<typeof playerSchema>;