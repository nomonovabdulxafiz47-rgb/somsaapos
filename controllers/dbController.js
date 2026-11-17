const supabase = require('../config/database');

// Barcha ma'lumotlarni olish (Somsachi, Sotuvchi, Tekshiruvchi va Admin bir-birini ko'rishi uchun)
exports.getFullState = async (req, res, next) => {
    try {
        const [
            usersRes,
            branchesRes,
            somsaTypesRes,
            prodRes,
            salesRes,
            expRes,
            auditRes,
            payHistRes,
            settingsRes
        ] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('branches').select('*'),
            supabase.from('somsa_types').select('*').order('id', { ascending: true }),
            supabase.from('production_logs').select('*').order('id', { ascending: false }).limit(1000),
            supabase.from('sales_logs').select('*').order('id', { ascending: false }).limit(1000),
            supabase.from('expense_logs').select('*').order('id', { ascending: false }).limit(500),
            supabase.from('audit_requests').select('*').order('id', { ascending: false }).limit(200),
            supabase.from('sub_payment_history').select('*').order('id', { ascending: false }),
            supabase.from('app_settings').select('*')
        ]);

        const settingsMap = {};
        (settingsRes.data || []).forEach(s => { settingsMap[s.key] = s.value; });

        res.json({
            success: true,
            users: (usersRes.data || []).map(u => ({
                phone: u.phone,
                passHash: u.pass_hash,
                plainPass: u.plain_pass,
                role: u.role,
                name: u.name,
                ownerPhone: u.owner_phone,
                branchId: u.branch_id,
                isSuperAdmin: u.is_super_admin,
                subStatus: u.sub_status,
                subApprovedAt: u.sub_approved_at,
                subExpiresAt: u.sub_expires_at,
                frozen: u.frozen,
                blocked: u.blocked
            })),
            branches: (branchesRes.data || []).map(b => ({
                id: b.id,
                ownerPhone: b.owner_phone,
                name: b.name,
                address: b.address,
                createdAt: b.created_at
            })),
            somsaTypes: somsaTypesRes.data || [],
            productionLogs: (prodRes.data || []).map(p => ({
                id: p.id,
                date: p.date,
                time: p.time,
                worker: p.worker,
                workerPhone: p.worker_phone,
                ownerPhone: p.owner_phone,
                branchId: p.branch_id,
                status: p.status,
                somsaId: p.somsa_id,
                somsaName: p.somsa_name,
                qty: p.qty,
                price: p.price,
                workerFee: p.worker_fee
            })),
            salesLogs: (salesRes.data || []).map(s => ({
                id: s.id,
                date: s.date,
                time: s.time,
                seller: s.seller,
                ownerPhone: s.owner_phone,
                branchId: s.branch_id,
                customer: s.customer,
                paymentType: s.payment_type,
                items: s.items,
                total: s.total
            })),
            expenseLogs: (expRes.data || []).map(e => ({
                id: e.id,
                date: e.date,
                time: e.time,
                seller: e.seller,
                ownerPhone: e.owner_phone,
                branchId: e.branch_id,
                title: e.title,
                amount: e.amount
            })),
            auditRequests: (auditRes.data || []).map(r => ({
                id: r.id,
                type: r.type,
                action: r.action,
                targetId: r.target_id,
                phone: r.phone,
                newPassPlain: r.new_pass_plain,
                newPassHash: r.new_pass_hash,
                newQty: r.new_qty,
                newItems: r.new_items,
                requestedBy: r.requested_by,
                reason: r.reason,
                status: r.status
            })),
            subPaymentHistory: (payHistRes.data || []).map(h => ({
                id: h.id,
                date: h.date,
                time: h.time,
                phone: h.phone,
                name: h.name,
                amount: h.amount,
                expiresAt: h.expires_at
            })),
            appSubSettings: settingsMap.appSubSettings || { price: 10000, cardNumber: '8600 0000 0000 0000', cardOwner: 'Asilbek Admin' },
            workerRate: Number(settingsMap.workerRate || 1500),
            crmExpensesVal: Number(settingsMap.crmExpensesVal || 0)
        });
    } catch (err) {
        next(err);
    }
};

// Somsa chiqarishni qo'shish (Kunlik tarix)
exports.addProduction = async (req, res, next) => {
    try {
        const p = req.body;
        const { error } = await supabase.from('production_logs').insert({
            id: p.id,
            date: p.date,
            time: p.time,
            worker: p.worker,
            worker_phone: p.workerPhone,
            owner_phone: p.ownerPhone,
            branch_id: p.branchId,
            status: p.status,
            somsa_id: p.somsaId,
            somsa_name: p.somsaName,
            qty: p.qty,
            price: p.price,
            worker_fee: p.workerFee
        });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Sotuv qo'shish (Kunlik tarix)
exports.addSale = async (req, res, next) => {
    try {
        const s = req.body;
        const { error } = await supabase.from('sales_logs').insert({
            id: s.id,
            date: s.date,
            time: s.time,
            seller: s.seller,
            owner_phone: s.ownerPhone,
            branch_id: s.branchId,
            customer: s.customer,
            payment_type: s.paymentType,
            items: s.items,
            total: s.total
        });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Rasxod qo'shish
exports.addExpense = async (req, res, next) => {
    try {
        const e = req.body;
        const { error } = await supabase.from('expense_logs').insert({
            id: e.id,
            date: e.date,
            time: e.time,
            seller: e.seller,
            owner_phone: e.ownerPhone,
            branch_id: e.branchId,
            title: e.title,
            amount: e.amount
        });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Filial yaratish
exports.createBranch = async (req, res, next) => {
    try {
        const { branch, baker, seller } = req.body;
        const { error: brErr } = await supabase.from('branches').insert({
            id: branch.id,
            owner_phone: branch.ownerPhone,
            name: branch.name,
            address: branch.address,
            created_at: branch.createdAt
        });
        if (brErr) throw brErr;

        const { error: uErr } = await supabase.from('users').insert([
            {
                phone: baker.phone,
                pass_hash: baker.passHash,
                plain_pass: baker.plainPass,
                role: 'somsachi',
                name: baker.name,
                owner_phone: baker.ownerPhone,
                branch_id: branch.id,
                sub_status: 'free'
            },
            {
                phone: seller.phone,
                pass_hash: seller.passHash,
                plain_pass: seller.plainPass,
                role: 'sotuvchi',
                name: seller.name,
                owner_phone: seller.ownerPhone,
                branch_id: branch.id,
                sub_status: 'free'
            }
        ]);
        if (uErr) throw uErr;
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Filialni o'chirish
exports.deleteBranch = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        await supabase.from('users').delete().eq('branch_id', branchId);
        await supabase.from('branches').delete().eq('id', branchId);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Foydalanuvchi qo'shish / yangilash
exports.upsertUser = async (req, res, next) => {
    try {
        const u = req.body;
        const { error } = await supabase.from('users').upsert({
            phone: u.phone,
            pass_hash: u.passHash,
            plain_pass: u.plainPass,
            role: u.role,
            name: u.name,
            owner_phone: u.ownerPhone || null,
            branch_id: u.branchId || null,
            is_super_admin: !!u.isSuperAdmin,
            sub_status: u.subStatus || 'unpaid',
            sub_approved_at: u.subApprovedAt || null,
            sub_expires_at: u.subExpiresAt || null,
            frozen: !!u.frozen,
            blocked: !!u.blocked
        });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Tekshiruvchini butunlay o'chirish
exports.deleteTekshiruvchi = async (req, res, next) => {
    try {
        const { phone } = req.params;
        await supabase.from('users').delete().eq('owner_phone', phone);
        await supabase.from('branches').delete().eq('owner_phone', phone);
        await supabase.from('users').delete().eq('phone', phone);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Oylik to'lovni tasdiqlash
exports.approvePayment = async (req, res, next) => {
    try {
        const { phone, paymentRecord, subApprovedAt, subExpiresAt } = req.body;
        await supabase.from('users').update({
            sub_status: '1month',
            sub_approved_at: subApprovedAt,
            sub_expires_at: subExpiresAt,
            frozen: false
        }).eq('phone', phone);

        await supabase.from('sub_payment_history').insert({
            id: paymentRecord.id,
            date: paymentRecord.date,
            time: paymentRecord.time,
            phone: paymentRecord.phone,
            name: paymentRecord.name,
            amount: paymentRecord.amount,
            expires_at: paymentRecord.expiresAt
        });

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Sozlamalar va Somsa turlarini saqlash
exports.saveSettings = async (req, res, next) => {
    try {
        const { key, value } = req.body;
        const { error } = await supabase.from('app_settings').upsert({ key, value });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

exports.saveSomsaTypes = async (req, res, next) => {
    try {
        const { somsaTypes } = req.body;
        const { error } = await supabase.from('somsa_types').upsert(somsaTypes);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Tahrirlash so'rovlari
exports.saveAuditRequest = async (req, res, next) => {
    try {
        const r = req.body;
        const { error } = await supabase.from('audit_requests').upsert({
            id: r.id,
            type: r.type,
            action: r.action,
            target_id: r.targetId || null,
            phone: r.phone || null,
            new_pass_plain: r.newPassPlain || null,
            new_pass_hash: r.newPassHash || null,
            new_qty: r.newQty || null,
            new_items: r.newItems || null,
            requested_by: r.requestedBy,
            reason: r.reason,
            status: r.status
        });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};
