export class HttpError extends Error {
	public statusCode: number;

	constructor(statusCode: number, name: string, message: string) {
		super(message);

		this.name = name;
		this.statusCode = statusCode;
	}
}

export class HttpErrorBadRequest extends HttpError {
	constructor(message: string) {
		super(400, 'Bad Request', message);
	}
}
