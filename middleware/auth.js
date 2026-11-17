const supabase = require('../config/database');

async function authMiddleware(req, res, next) {
    try {
        const userPhone = req.headers['x-user-phone'];
        if (!userPhone) {
            return res.status(401).json({ success: false, message: "Avtorizatsiya talab qilinadi!" });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone', userPhone)
            .single();

        if (error || !user) {
            return res.status(401).json({ success: false, message: "Foydalanuvchi topilmadi!" });
        }

        if (user.frozen || user.blocked) {
            return res.status(403).json({ success: false, message: "Hisobingiz muzlatilgan yoki bloklangan!" });
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = authMiddleware;
