import type { core, z, ZodObject } from 'zod';

export type BaseTag = string;
type BaseExtra = object;
type Extra<E extends BaseExtra> = [E] extends [never]
  ? { readonly extra?: E }
  : { readonly extra: E };

const TAG: unique symbol = Symbol('TAG');
// const TAG = 'TAG';

export interface BaseError<Tag extends BaseTag, Ext extends BaseExtra> {
  readonly [TAG]: Tag;
  readonly message: string;
  readonly stack: string;
  readonly cause?: unknown;
  readonly extra?: Ext;
}

type ErrorOptions<Ext extends BaseExtra> = {
  readonly cause?: unknown;
  readonly stack?: string;
} & Extra<Ext>;

type ErrorBuilder<Tag extends BaseTag, Extra extends BaseExtra> = {
  readonly handle: (error: unknown) => BaseError<Tag, Extra>;
  readonly is: { [TAG]: Tag };
  readonly isFn: (val: unknown) => val is BaseError<Tag, Extra>;
} & ([Extra] extends [never]
  ? {
      (message: string, options?: ErrorOptions<Extra>): BaseError<Tag, Extra>;
    }
  : // Extra が指定されていたら options で extra を設定しないとコンパイルエラーにする
    {
      (message: string, options: ErrorOptions<Extra>): BaseError<Tag, Extra>;
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferError<Builder extends ErrorBuilder<any, any>> =
  ReturnType<Builder>;

export const errorBuilder = <
  Tag extends BaseTag,
  Extra extends
    | ZodObject<Shape, Config>
    // | Record<string | number | symbol, unknown>
    | undefined = undefined,
  Shape extends core.$ZodShape = core.$ZodLooseShape,
  Config extends core.$ZodObjectConfig = core.$strip,
  ActualExtra extends object = Extra extends ZodObject<Shape, Config>
    ? z.infer<Extra>
    : Extra extends object
      ? Extra
      : never,
>(
  tag: Tag,
  extraSchema?: Extra
): ErrorBuilder<Tag, ActualExtra> =>
  Object.assign(
    (
      message: string,
      options?: ErrorOptions<ActualExtra>
    ): BaseError<Tag, ActualExtra> => {
      return {
        [TAG]: tag,
        message: message,
        stack: options?.stack ?? replaceErrorName(new Error().stack, tag),
        cause: options?.cause,
        extra: options?.extra,
      };
    },
    {
      handle: (error: unknown): BaseError<Tag, ActualExtra> => {
        if (error instanceof Error) {
          return {
            [TAG]: tag,
            message: error.message,
            stack: replaceErrorName(new Error().stack, tag),
            cause: error,
          };
        }

        return {
          [TAG]: tag,
          message: 'An unknown error occurred',
          stack: replaceErrorName(new Error().stack, tag),
          cause: error,
        };
      },
      is: {
        [TAG]: tag,
      },
      isFn: (val: unknown): val is BaseError<Tag, ActualExtra> =>
        typeof val === 'object' &&
        val !== null &&
        TAG in val &&
        val[TAG] === tag,
      zod: extraSchema, // to avoid unused variable error of extraSchema
    }
  );

function replaceErrorName(stack: string | undefined, name: string): string {
  return stack?.replace(/Error/g, name) ?? '';
}
