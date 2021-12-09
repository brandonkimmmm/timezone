declare namespace Express {
	interface Request {
		nanoid: string;
		user: any;
	}
}