import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ServiceProvider from "../../model/serviceProviderModel.js";

export const register = async (req, res) => {
    const { name, email, password, gender, phone, location, lat, lng } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, msg: 'Name, email and password are required.' });
    }

    try {
        const existingUser = await ServiceProvider.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, msg: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const providerData = { name, email, password: hashedPassword, gender, phone, location };

        if (lat && lng) {
            providerData.exactLocation = {
                type: 'Point',
                coordinates: [Number(lng), Number(lat)]
            };
        }

        const user = new ServiceProvider(providerData);
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Never send hashed password back to client
        const { password: _pw, ...safeUser } = user.toObject();

        return res.status(201).json({ success: true, msg: "Registration successful.", user: safeUser, token });

    } catch (err) {
        console.error("Provider register error:", err.message);
        return res.status(500).json({ success: false, msg: "Server error. Please try again." });
    }
};

export default register;
