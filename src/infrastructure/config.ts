import dotenv from 'dotenv';
import typia from 'typia';

import { Once } from '@SRC/common/once';
import { Random } from '@SRC/common/random';

const once = Once.unit(() => {
    switch (process.env['NODE_ENV']) {
        case 'development':
            dotenv.config({ path: '.env', override: true });
            break;
        case 'test':
            dotenv.config({ path: '.env.test', override: true });
            break;
        case 'production':
            break;
        default:
            throw Error(
                'NODE_ENV should be one of (development|production|test)',
            );
    }

    return process.env['NODE_ENV'] === 'test'
        ? ({
              PORT: 4000,
              ACCESS_TOKEN_KEY: Random.string(32),
              REFRESH_TOKEN_KEY: Random.string(32),
              ...process.env,
          } as unknown as IConfig)
        : typia.assert<IConfig>({ PORT: 4000, ...process.env });
});

export const config = <T extends keyof IConfig>(key: T): IConfig[T] =>
    once.run()[key];

export const initConfig = () => once.init();

interface IConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    /** @default 4000 */
    PORT: number;
    DATABASE_URL: string;

    ACCESS_TOKEN_KEY: string &
        typia.tags.MinLength<32> &
        typia.tags.MaxLength<32>;
}
