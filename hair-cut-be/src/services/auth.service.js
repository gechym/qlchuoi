import { z } from "zod";
import db from "../database/index.js";
import tokenService from "./token.service.js";
import emailService from "./email.service.js";

export const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	fullName: z.string().min(1),
	phone: z.string().optional(),
});

export const loginSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(3),
});

const registerUser = async (payload) => {
	const { email, password, fullName, phone } = payload;
	console.log("Registering user", payload);
	try {
		// Tạo mã xác thực
		const verificationCode = emailService.generateVerificationCode();
		const verificationExpires = new Date();
		verificationExpires.setMinutes(verificationExpires.getMinutes() + 15); // Hết hạn sau 15 phút

		const user = await db.user.create({
			data: {
				email,
				password,
				phone,
				fullName,
				availabilityStatus: "available",
				createdAt: new Date(),
				role: "customer",
				status: "active",
				is_verify: false,
				verification_code: verificationCode,
				verification_expires: verificationExpires,
			},
		});

		// Gửi email xác thực
		await emailService.sendVerificationEmail(email, fullName, verificationCode);

		return {
			id: user.id,
			role: user.role,
			fullName: user.fullName,
			phone: user.phone,
			email: user.email,
			is_verify: user.is_verify,
			message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
		};
	} catch (err) {
		throw new Error(err.message);
	}
};

const loginUser = async (payload) => {
	const { username, password } = payload;
	try {
		const user = await db.user.findFirst({
			where: {
				OR: [{ email: username }, { phone: username }],
			},
		});
		if (!user) throw new Error("User not found");
		if (user.status !== "active") throw new Error("User is not active");
		if (user.password !== password) throw new Error("Invalid password");
		
		// Kiểm tra xác thực email (chỉ cảnh báo, không chặn đăng nhập)
		const accessToken = tokenService.signAccessToken({
			id: user.id,
			email: user.email,
			role: user.role,
			phone: user.phone,
			fullName: user.fullName,
		});
		
		return {
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				fullName: user.fullName,
				phone: user.phone,
				availabilityStatus: user.availabilityStatus,
				status: user.status,
				is_verify: user.is_verify,
			},
		};
	} catch (err) {
		throw new Error(err.message);
	}
};

const getUserByPhoneOrCreate = async (phone) => {
	try {
		const user = await db.user.findFirst({
			where: {
				phone,
			},
		});
		if (!user) {
			return await registerUser({
				phone,
				password: phone,
				fullName: phone,
				email: phone,
			});
		}
		return user;
	} catch (err) {
		throw new Error(err.message);
	}
};

const isPhoneRegistered = async (phone) => {
	try {
		const user = await db.user.findFirst({
			where: {
				phone,
			},
		});
		return !!user;
	} catch (err) {
		throw new Error(err.message);
	}
};
const isEmailRegistered = async (email) => {
	try {
		const user = await db.user.findFirst({
			where: {
				email,
			},
		});
		return !!user;
	} catch (err) {
		throw new Error(err.message);
	}
};

// Xác thực email bằng code
const verifyEmail = async (email, code) => {
	try {
		const user = await db.user.findFirst({
			where: { email },
		});

		if (!user) {
			throw new Error("Không tìm thấy tài khoản");
		}

		if (user.is_verify) {
			throw new Error("Tài khoản đã được xác thực");
		}

		if (user.verification_code !== code) {
			throw new Error("Mã xác thực không đúng");
		}

		if (new Date() > user.verification_expires) {
			throw new Error("Mã xác thực đã hết hạn");
		}

		// Cập nhật trạng thái xác thực
		await db.user.update({
			where: { id: user.id },
			data: {
				is_verify: true,
				verification_code: null,
				verification_expires: null,
			},
		});

		return {
			message: "Xác thực email thành công!",
			success: true,
		};
	} catch (err) {
		throw new Error(err.message);
	}
};

// Gửi lại mã xác thực
const resendVerificationCode = async (email) => {
	try {
		const user = await db.user.findFirst({
			where: { email },
		});

		if (!user) {
			throw new Error("Không tìm thấy tài khoản");
		}

		if (user.is_verify) {
			throw new Error("Tài khoản đã được xác thực");
		}

		// Tạo mã xác thực mới
		const verificationCode = emailService.generateVerificationCode();
		const verificationExpires = new Date();
		verificationExpires.setMinutes(verificationExpires.getMinutes() + 15);

		await db.user.update({
			where: { id: user.id },
			data: {
				verification_code: verificationCode,
				verification_expires: verificationExpires,
			},
		});

		// Gửi email xác thực
		await emailService.sendVerificationEmail(email, user.fullName, verificationCode);

		return {
			message: "Đã gửi lại mã xác thực qua email!",
			success: true,
		};
	} catch (err) {
		throw new Error(err.message);
	}
};

export default {
	registerUser,
	loginUser,
	getUserByPhoneOrCreate,
	isPhoneRegistered,
	isEmailRegistered,
	verifyEmail,
	resendVerificationCode,
};
