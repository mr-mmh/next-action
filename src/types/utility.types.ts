/**
 * @description check if a type is defined or not
 * this type utitliy is base on unknown type for undefined and other to defined
 */
export type IsDefined<T> = unknown extends T
    ? T extends unknown
        ? false
        : true
    : true;

/**
 * Defines a type for a callback function that takes an input of type `TInput` and returns an output of type `TOutput`.
 * If `TInput` is defined (not unknown), the callback function will take a parameter of type `TInput`.
 * Otherwise, the callback function will take no parameters.
 *
 * @template TInput - The type of the input parameter for the callback function.
 * @template TOutput - The type of the output value returned by the callback function.
 */
export type ConditionalCallback<TInput, TOutput> =
    IsDefined<TInput> extends true ? (data: TInput) => TOutput : () => TOutput;

/**
 * Extracts types from a union that satisfy a given condition.
 *
 * @template T - The union type to be filtered.
 * @template TCond - The condition type that the extracted types must satisfy.
 *
 * @example
 * ```typescript
 * type Result = ExtractTypeWithCondition<string | number | boolean, string>;
 *  /// Result is string
 * ```
 */
export type ExtractTypeWithCondition<T, TCond> = T extends TCond ? T : never;
