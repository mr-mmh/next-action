import type { ActionErrorCode, ActionResponseError, ActionStatus } from "./action-base.types";

export type ErrConvertor = {
    [key in ActionErrorCode]: string;
};

export type ActionState<TOutput> = {
    res: TOutput | undefined;
    resultStatus: ActionStatus | undefined;
    errRawResult: ActionResponseError | undefined;
    errMsg: string | undefined;
    runCounter: number;
    validationErrors?: { [key: string]: string };
};

export type ActionStateSuccess<TOutput> = {
    res: TOutput;
    resultStatus: Extract<ActionStatus, "Success">;
    errRawResult: undefined;
    errMsg: undefined;
    validationErrors?: undefined;
};

export type ActionStateError = {
    res: undefined;
    resultStatus: Exclude<ActionStatus, "Success">;
    errRawResult: ActionResponseError;
    errMsg: string;
    validationErrors?: { [key: string]: string };
};

export type ParseActionResult<TOutput> = ActionStateSuccess<TOutput> | ActionStateError;
