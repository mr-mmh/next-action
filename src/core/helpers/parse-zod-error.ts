import { ZodError } from "zod";

/**
 * this function get zError or result.error (after safeParse with zod) and return an object with key of field and value of
 * error msg (that prepeare with zod).
 * @param zError
 * @returns
 */
export function parseZodError(zError: ZodError): { [key: string]: string } {
    let zodErrors = {};
    // handle error
    zError.issues.forEach((issue) => {
        zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
    });
    return zodErrors;
}
