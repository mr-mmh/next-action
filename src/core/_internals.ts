import { parseZodError } from "./helpers";
import { ActionError } from "./action-error";
import type { AccessOptions, GetUserFn, ValidateOptions } from "../types";

export async function checkAccess<TRoles, TUser extends { role: TRoles }>(
    accessOptions: AccessOptions<TRoles>,
    getUserFn: GetUserFn<TUser>
) {
    const user = await getUserFn();
    if (!user) {
        const loginErrMsg =
            typeof accessOptions.loginRequired === "object"
                ? accessOptions.loginRequired.errMsg
                : undefined;
        throw new ActionError({
            message: loginErrMsg ?? "login required",
            name: "checkAccess",
            code: "loginRequired",
            status: "Error",
        });
    }

    if (accessOptions.roles) {
        const [roleErrMsg, roles] = Array.isArray(accessOptions.roles)
            ? [undefined, accessOptions.roles]
            : [accessOptions.roles.errMsg, accessOptions.roles.roles];

        if (roles.length && !roles.includes(user.role)) {
            throw new ActionError({
                message: roleErrMsg ?? "access denied",
                name: "checkAccess",
                code: "noAccess",
                status: "Error",
            });
        }
    }
    return user;
}

export function checkValidate<TInput>(
    validateOptions: ValidateOptions<TInput>,
    data: TInput
) {
    const [schema, schemaErrMsg] =
        typeof validateOptions === "object" && "schema" in validateOptions
            ? [validateOptions.schema, validateOptions.errMsg]
            : [validateOptions, undefined];
    const schemaValidation = schema.safeParse(data);
    if (!schemaValidation.success) {
        throw new ActionError({
            message: schemaErrMsg ?? "validation error",
            name: "checkValidate",
            code: "validation",
            status: "Error",
            errors: parseZodError(schemaValidation.error),
        });
    }
    return schemaValidation.data;
}
