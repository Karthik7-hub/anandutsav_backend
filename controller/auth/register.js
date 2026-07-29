import jwt from "jsonwebtoken";
import userModel from "../../model/userModel.js";
import sendOtpEmail from "../../utils/sendOtp.js";

// Helper to create JWT
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Step 1: Register → create user & send OTP
export const register = async (req, res) => {
  try {
    const { username, fullName, phone, email, location, gender, lat, lng } = req.body;

    if (!fullName || !phone || !email) {
      return res
        .status(400)
        .json({ success: false, msg: "Required fields missing" });
    }

    let existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, msg: "User already exists with this email" });
    }

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const userData = {
      username: username || email.split('@')[0],
      fullName,
      phone,
      email,
      location,
      gender,
      Otp: otp,
      OtpExpireAt: Date.now() + 2 * 60 * 1000, // 2 mins expiry
    };

    if (lat && lng) {
      userData.locationCoordinates = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      };
    }

    const user = new userModel(userData);
    await user.save();

    await sendOtpEmail(email, otp);

    return res
      .status(200)
      .json({ success: true, msg: "OTP sent to email. Please verify." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, msg: "Server error during registration" });
  }
};

// ✅ Step 2: Verify OTP → issue JWT + set cookie
export const verifyOtp = async (req, res) => {
  try {
    const { email, userOtp } = req.body;

    if (!email || !userOtp) {
      return res.status(400).json({ success: false, msg: "Email and OTP are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "User not found. Please register again." });
    }

    // Check OTP
    if (String(userOtp) !== String(user.Otp)) {
      return res.status(400).json({ success: false, msg: "Invalid OTP" });
    }

    if (Date.now() > user.OtpExpireAt) {
      return res.status(400).json({ success: false, msg: "OTP expired" });
    }

    // Clear OTP after successful verification
    user.Otp = "";
    user.OtpExpireAt = 0;
    await user.save();

    // Generate JWT
    const token = generateToken(user._id, user.email);

    // ✅ Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = user.toObject();
    delete userObj.Otp;
    delete userObj.OtpExpireAt;

    return res.status(200).json({
      success: true,
      msg: "OTP verified, registration complete",
      token,
      u: userObj
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ success: false, msg: "Server error during verification" });
  }
};

export default { register, verifyOtp };
