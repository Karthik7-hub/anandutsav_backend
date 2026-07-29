const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        return res.status(200).json({ success: true, msg: "Logged Out" });
    } catch (err) {
        console.error("User logout error:", err.message);
        return res.status(500).json({ success: false, msg: "Logout failed" });
    }
};

export default logout;