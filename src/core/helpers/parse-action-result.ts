import {
    ActionResponseError,
    ActionResponseOk,
    ErrConvertor,
    ParseActionResult,
} from "../../types";

export function parseActionResult<TOutput>(
    actRes: ActionResponseOk<TOutput> | ActionResponseError,
    errConvertor?: ErrConvertor,
): ParseActionResult<TOutput> {
    if (actRes.status === "Success") {
        return {
            res: actRes.res,
            resultStatus: "Success",
            errRawResult: undefined,
            errMsg: undefined,
            validationErrors: undefined,
        };
    } else {
        return {
            res: undefined,
            resultStatus: actRes.status,
            errMsg:
                errConvertor && errConvertor[actRes.code]
                    ? errConvertor[actRes.code]
                    : actRes.message,
            errRawResult: actRes,
            validationErrors:
                actRes.code === "validation" && actRes.errors
                    ? actRes.errors
                    : undefined,
        };
    }
}
