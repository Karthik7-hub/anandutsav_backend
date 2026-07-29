import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ServiceProvider from "../../model/serviceProviderModel.js";

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, msg: "Email and password are required." });
    }

    try {
        const user = await ServiceProvider.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, msg: "Invalid email or password." });
        }

        const isMatched = await bcrypt.compare(password, user.password);
        
        if (!isMatched) {
            return res.status(401).json({ success: false, msg: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Never send hashed password back to client
        const { password: _pw, ...safeUser } = user.toObject();

        return res.status(200).json({ success: true, msg: "User logged in successfully.", user: safeUser, token });

    } catch (err) {
        console.error("Provider login error:", err.message);
        return res.status(500).json({ success: false, msg: "Server error. Login failed." });
    }
};

export default login;
