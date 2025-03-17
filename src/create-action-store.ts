import { actionCreatorBase } from "./core/action-creator-base";
import type { ActionOptions, GetUserFn } from "./types";

export function createActionStore<
    TRoles extends string,
    TUser extends { role: TRoles },
>(
    getUserFn: GetUserFn<TUser>,
    mainOptions?: ActionOptions<TRoles, TUser, any, any>,
) {
    return function <TInput = unknown, TOutput = unknown>(
        action: (data: TInput, context?: { user: TUser }) => Promise<TOutput>,
        options?: ActionOptions<TRoles, TUser, TInput, TOutput>,
    ) {
        return actionCreatorBase<TRoles, TUser, TInput, TOutput>(
            getUserFn,
            action,
            { ...mainOptions, ...options },
        );
    };
}
