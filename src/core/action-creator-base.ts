import { redirect } from "next/navigation";
import { ActionError } from "./action-error";
import { checkAccess, checkValidate } from "./_internals";
import type {
    ActionOptions,
    ActionResponseError,
    ActionResponseOk,
    ConditionalCallback,
    GetUserFn,
} from "../types";

export function actionCreatorBase<
    TRoles extends string,
    TUser extends { role: TRoles },
    TInput = unknown,
    TOutput = unknown,
>(
    getUserFn: GetUserFn<TUser>,
    action: (data: TInput, context?: { user: TUser }) => Promise<TOutput>,
    options?: ActionOptions<TRoles, TUser, TInput, TOutput>
) {
    const _action: ConditionalCallback<
        TInput,
        Promise<ActionResponseOk<TOutput> | ActionResponseError>
    > = (async (data: any) => {
        // ! data can be undefined
        // ! this senario work correctly! because of JS function can call with undefined args.
        // ! so for better TS inference we use this trick :)
        let validateData = data;
        let user: TUser | null = null;
        let actionResult: Awaited<TOutput>;

        try {
            if (options) {
                if (
                    options.access &&
                    (!!options.access.loginRequired || !!options.access.roles)
                ) {
                    user = await checkAccess(options.access, getUserFn);
                }
                if (data && options.validate && validateData) {
                    validateData = checkValidate<TInput>(
                        options.validate,
                        data
                    );
                }
            }
            actionResult = await action(
                validateData,
                user ? { user } : undefined
            );
        } catch (error: any) {
            if (options?.alwaysThrow && options.alwaysThrow === true) {
                throw error;
            }
            if (error instanceof ActionError && error.isActionError) {
                return {
                    status: "Error",
                    error: true,
                    success: false,
                    code: error.code,
                    message: error.message,
                    name: error.name,
                    errors: error.errors,
                };
            }
            if (!options?.unhandledError?.throw) {
                //! for safty just error that has default name Error allowed to send message to client.
                const isSafeError =
                    error instanceof Error &&
                    error.name === "Error" &&
                    error.message.length < 100;
                const message =
                    options?.unhandledError?.errMsg ??
                    (isSafeError
                        ? error.message
                        : "Something went wrong in server.");
                return {
                    status: "UnhandledError",
                    error: true,
                    success: false,
                    code: "other",
                    message: message,
                    name: "unhandledError",
                };
            }
            throw error;
        }

        // ! redirect prevent send output. only if no action result here.
        if (options?.redirectTo) {
            redirect(options.redirectTo);
        } else if (options?.redirect) {
            redirect(
                options.redirect({
                    user,
                    input: validateData,
                    result: actionResult,
                })
            );
        } else {
            return {
                status: "Success",
                res: actionResult,
            };
        }
    }) as any;
    return _action;
}
