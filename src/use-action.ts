import React from "react";
import { parseActionResult } from "./core/helpers";
import type {
    ActionResponseError,
    ActionResponseOk,
    ActionState,
    ConditionalCallback,
    ErrConvertor,
} from "./types";

type UseActionConfig<TInput, TOutput> = {
    actionFn: ConditionalCallback<
        TInput,
        Promise<ActionResponseOk<TOutput> | ActionResponseError>
    >;
    validationErrSetter?: (errors: { [key: string]: any }) => void;
    errConvertor?: ErrConvertor;
    onSuccess?: (res: ActionResponseOk<TOutput>["res"]) => void;
    onError?: (err: ActionResponseError) => void;
    onFinish?: (
        result:
            | ActionResponseError["status"]
            | ActionResponseOk<TOutput>["status"]
            | "redirect",
    ) => void;
};

export function useAction<TInput, TOutput>({
    actionFn,
    errConvertor,
    validationErrSetter,
    onError,
    onSuccess,
    onFinish,
}: UseActionConfig<TInput, TOutput>) {
    const [actionState, setActionState] = React.useState<ActionState<TOutput>>({
        res: undefined,
        resultStatus: undefined,
        errRawResult: undefined,
        errMsg: undefined,
        validationErrors: undefined,
        runCounter: 0,
    });
    const [isActionRunning, startAction] = React.useTransition();

    const runAction = React.useCallback<
        ConditionalCallback<TInput, Promise<void>>
    >(
        async (data?: TInput) => {
            startAction(() => {
                actionFn(data as TInput).then((result) => {
                    // ! for redirection target we have not any result;
                    const _result: typeof result | undefined =
                        result ?? undefined;
                    if (_result) {
                        setActionState((prev) => ({
                            ...parseActionResult(result, errConvertor),
                            runCounter: prev.runCounter + 1,
                        }));
                        if (onSuccess && _result.status === "Success") {
                            onSuccess(_result.res);
                        }
                        if (onError && _result.status !== "Success") {
                            onError(_result);
                        }
                        if (
                            validationErrSetter &&
                            _result &&
                            _result.status === "Error" &&
                            _result.code === "validation" &&
                            _result.errors
                        ) {
                            validationErrSetter(_result.errors);
                        }
                    }
                    if (onFinish) {
                        onFinish(_result?.status ?? "redirect");
                    }
                });
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return {
        isActionRunning,
        ...actionState,
        runAction,
    };
}
