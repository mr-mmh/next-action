import { ExtractTypeWithCondition, IsDefined } from "./utility.types";
import type { Schema } from "zod";

export type GetUserFn<TUser> = () => Promise<TUser | null>;

// options
export type loginRequiredOptions = boolean | { errMsg?: string };
export type RolesOptions<TRoles> =
    | TRoles[]
    | {
          roles: TRoles[];
          errMsg?: string;
      };
export type AccessOptions<TRoles> = {
    loginRequired?: loginRequiredOptions;
    roles?: RolesOptions<TRoles>;
};

export type ValidateOptions<TInput> =
    | Schema<TInput>
    | { schema: Schema<TInput>; errMsg?: string };

export type ActionOptions<TRoles, TUser, TInput, TOutput> = {
    access?: AccessOptions<TRoles>;
    validate?: ValidateOptions<TInput>;
    alwaysThrow?: boolean; // to throw any error for compatibility with other stuff
    unhandledError?: {
        errMsg?: string;
        throw?: boolean;
    };
    redirectTo?: string;
    redirect?: (context: {
        user?: TUser | null;
        input: TInput;
        result: Awaited<TOutput>;
    }) => string;
};

export type ActionErrorCode =
    | "loginRequired"
    | "noAccess"
    | "validation"
    | "other";
export type ActionStatus = "Success" | "Error" | "UnhadledError";

export type ActionResponseError = {
    status: Exclude<ActionStatus, "Success">;
    error: true;
    success: false;
    code: ActionErrorCode;
    message: string;
    name: string;
    errors?: { [key: string]: any };
};

export type ActionResponseOk<TRes> = {
    status: Extract<ActionStatus, "Success">;
    res: TRes;
};

/**
 * Extracts the response type from an asynchronous action function that returns a promise.
 *
 * @template TAction - The type of the action function. It should be a function that takes any number of arguments and returns a Promise.
 *
 * The type of the response object when the action function resolves successfully.
 */
export type ActionResType<TAction extends (...data: any[]) => Promise<any>> =
    ExtractTypeWithCondition<
        Awaited<ReturnType<TAction>>,
        { status: "Success" }
    >["res"];
