import { authenticateMiddleware } from "../middlewares/auth.js";
import authService, {
	loginSchema,
	registerSchema,
} from "../services/auth.service.js";
import { processRequestBody } from "zod-express-middleware";

const registerUser = [
	processRequestBody(registerSchema),
	async (req, res) => {
		return res.status(201).json(await authService.registerUser(req.body));
	},
];

const loginUser = [
	processRequestBody(loginSchema),
	async (req, res) => {
		return res.status(200).json(await authService.loginUser(req.body));
	},
];

const getCurrentUser = [
	authenticateMiddleware,
	async (req, res) => {
		const user = req.user;
		if (!user) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		return res.status(200).json(user);
	},
];

const isPhoneRegistered = [
	async (req, res) => {
		// from query params
		const { phone } = req.query;
		if (!phone)
			return res.status(400).json({ message: "Phone is required" });
		const isRegistered = await authService.isPhoneRegistered(phone);
		return res.status(200).json({ isRegistered });
	},
];

const isEmailRegistered = [
	async (req, res) => {
		const { email } = req.query;
		if (!email)
			return res.status(400).json({ message: "Email is required" });
		const isRegistered = await authService.isEmailRegistered(email);
		return res.status(200).json({ isRegistered });
	},
];

const verifyEmail = [
	async (req, res) => {
		const { email, code } = req.body;
		if (!email || !code) {
			return res.status(400).json({ message: "Email và mã xác thực là bắt buộc" });
		}
		try {
			const result = await authService.verifyEmail(email, code);
			return res.status(200).json(result);
		} catch (error) {
			return res.status(400).json({ message: error.message });
		}
	},
];

const resendVerificationCode = [
	async (req, res) => {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: "Email là bắt buộc" });
		}
		try {
			const result = await authService.resendVerificationCode(email);
			return res.status(200).json(result);
		} catch (error) {
			return res.status(400).json({ message: error.message });
		}
	},
];

const verifyEmailByLink = [
	async (req, res) => {
		try {
			const { email, verification_code } = req.query;
			authService.verifyEmailByLink(
				email,
				verification_code
			);
			return res.status(200).send("Xác thực email thành công! vui lòng đăng nhập lại");
		} catch (error) {
			return res.status(400).json({ message: error.message });
		}
	},
];

export default {
	registerUser,
	loginUser,
	getCurrentUser,
	isPhoneRegistered,
	isEmailRegistered,
	verifyEmail,
	resendVerificationCode,
	verifyEmailByLink,
};
