import { randomInt, randomUUID } from 'crypto';
import typia from 'typia';

import { Num, Regex } from '@SRC/common/type';

export namespace Random {
    export const uuid = (): Regex.UUID => randomUUID();
    /** `min <= n < max` */
    export const int = ({
        min = 0,
        max,
    }: {
        min?: number;
        max: number;
    }): Num.Int64 => randomInt(min, max);
    /** `0 <= n < max` */
    export const double = (max: number): Num.Double => Math.random() * max;
    export function string(max: number): string;
    export function string(min: number, max: number): string;
    export function string(min: number, max?: number) {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = max === undefined ? min : int({ min, max });
        return Array.from({ length }, () =>
            chars.charAt(int({ max: chars.length })),
        ).join('');
    }
    export const iso = typia.createRandom<Regex.DateTime>();
}
