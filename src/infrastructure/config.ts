import dotenv from 'dotenv';
import typia from 'typia';

import { Random } from '@SRC/utils/random';

const init = () => {
    switch (process.env['NODE_ENV']) {
        case 'development':
            dotenv.config({ path: '.env' });
            break;
        case 'test':
            dotenv.config({ path: '.env.test' });
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
              ...process.env,
              ACCESS_TOKEN_KEY: Random.string(32),
              REFRESH_TOKEN_KEY: Random.string(32),
          } as unknown as IEnv)
        : typia.assert<IEnv>({ PORT: 4000, ...process.env });
};
export const Configuration: IEnv = init();

interface IEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    /** @default 4000 */
    readonly PORT: number;
    readonly DATABASE_URL: string;

    readonly ACCESS_TOKEN_KEY: string &
        typia.tags.MinLength<32> &
        typia.tags.MaxLength<32>;
}
