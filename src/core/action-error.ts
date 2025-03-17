import { ActionErrorCode, ActionStatus } from "../types";

type ActionErrorDetails = {
    name: string;
    status: ActionStatus;
    message: string;
    code: ActionErrorCode;
    errors?: { [key: string]: any };
};

export class ActionError extends Error {
    public isActionError = true;
    public status: ActionStatus;
    public code: ActionErrorCode;
    public errors?: { [key: string]: any };
    constructor(args: ActionErrorDetails) {
        super(args.message);
        this.name = args.name;
        this.status = args.status;
        this.code = args.code;
        this.errors = args.errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
