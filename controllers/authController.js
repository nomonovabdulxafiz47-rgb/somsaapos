const supabase = require('../config/database');

exports.login = async (req, res, next) => {
    try {
        const { login, password, role } = req.body;
        if (!login || !password) {
            return res.status(400).json({ success: false, message: "Login va parolni kiriting!" });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .ilike('phone', login.trim())
            .single();

        if (error || !user) {
            return res.status(401).json({ success: false, message: "Login yoki parol xato!" });
        }

        if (user.plain_pass !== password && user.pass_hash !== password) {
            return res.status(401).json({ success: false, message: "Login yoki parol xato!" });
        }

        if (!user.is_super_admin && role && user.role !== role) {
            return res.status(403).json({ success: false, message: `Bu hisob "${user.role}" lavozimiga tegishli!` });
        }

        if (user.frozen) {
            return res.status(403).json({ success: false, message: "❄️ Hisobingiz oylik to'lov sababli muzlatilgan!" });
        }

        if (user.blocked) {
            return res.status(403).json({ success: false, message: "⛔ Hisobingiz bloklangan!" });
        }

        // Xodim kirayotganda tekshiruvchi muzlatilganligini tekshirish
        if (user.owner_phone) {
            const { data: owner } = await supabase
                .from('users')
                .select('frozen')
                .eq('phone', user.owner_phone)
                .single();
            if (owner && owner.frozen) {
                return res.status(403).json({ success: false, message: "❄️ Filial egasi hisobi muzlatilgan!" });
            }
        }

        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};
