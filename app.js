// ===== SalesHub Pro - Main Application =====
// ============================================

// ===== State Management =====
const APP = {
    lang: 'ar',
    theme: 'light',
    currentUser: null,
    currentPage: 'auth',
    charts: { agents: null, packages: null }
};

// ===== Data Store (localStorage) =====
const DB = {
    get(key) { try { return JSON.parse(localStorage.getItem('shp_' + key)) || null; } catch { return null; } },
    set(key, val) { localStorage.setItem('shp_' + key, JSON.stringify(val)); },
    del(key) { localStorage.removeItem('shp_' + key); },
    getAll() {
        return {
            users: this.get('users') || [],
            clients: this.get('clients') || [],
            notifications: this.get('notifications') || [],
            settings: this.get('settings') || {
                baseSalary: 3000, freeClientComm: 10,
                pkg10Comm: 50, pkg25Comm: 80,
                pkg60Comm: 120, pkgUnlimitedComm: 200
            },
            plans: [
                { id: 'free', name: 'مجاني', nameEn: 'Free', price: 0, agents: 3 },
                { id: 'basic', name: 'أساسي', nameEn: 'Basic', price: 500, agents: 10 },
                { id: 'pro', name: 'احترافي', nameEn: 'Pro', price: 1000, agents: 25 },
                { id: 'business', name: 'أعمال', nameEn: 'Business', price: 2000, agents: 60 },
                { id: 'enterprise', name: 'غير محدود', nameEn: 'Enterprise', price: 3500, agents: -1 }
            ]
        };
    },
    saveAll(data) {
        this.set('users', data.users);
        this.set('clients', data.clients);
        this.set('notifications', data.notifications);
        this.set('settings', data.settings);
    }
};

// ===== Translations =====
const T = {
    ar: {
        login: 'تسجيل الدخول', register: 'تسجيل حساب جديد',
        welcome: 'مرحباً بك في SalesHub Pro', createAccount: 'أنشئ حسابك',
        noAccount: 'ليس لديك حساب؟ سجل الآن', hasAccount: 'لديك حساب؟ سجل دخول',
        forgotPass: 'نسيت كلمة المرور؟', resetPass: 'إعادة تعيين كلمة المرور',
        sendReset: 'إرسال رابط الاستعادة', backToLogin: 'العودة لتسجيل الدخول',
        dashboard: 'لوحة التحكم', agents: 'المناديب', clients: 'العملاء',
        reports: 'التقارير', settings: 'الإعدادات',
        notifications: 'الإشعارات', clearAll: 'مسح الكل',
        addAgent: 'إضافة مندوب', editAgent: 'تعديل مندوب',
        addClient: 'إضافة عميل', editClient: 'تعديل عميل',
        name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الموبايل',
        address: 'العنوان', package: 'الباقة', status: 'الحالة',
        commission: 'العمولة', salary: 'الراتب', total: 'الإجمالي',
        save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل',
        active: 'نشط', inactive: 'غير نشط', warning: 'تحذير',
        aboutUs: 'من نحن', contactUs: 'اتصل بنا', privacy: 'سياسة الخصوصية',
        terms: 'الشروط والأحكام', refund: 'سياسة الاسترجاع والاستبدال',
        freePlan: 'مجاني', basicPlan: 'أساسي', proPlan: 'احترافي',
        businessPlan: 'أعمال', enterprisePlan: 'غير محدود',
        admin: 'مدير', agent: 'مندوب', agencyId: 'رقم الوكالة',
        noData: 'لا توجد بيانات', loading: 'جاري التحميل...',
        phoneInvalid: 'رقم الموبايل غير صحيح',
        emailInvalid: 'البريد الإلكتروني غير صالح',
        duplicateEmail: '⚠️ تم اكتشاف بريد إلكتروني مكرر للعميل',
        duplicatePhone: '⚠️ تم اكتشاف رقم موبايل مكرر للعميل',
        clientAdded: 'تم إضافة العميل بنجاح',
        agentAdded: 'تم إضافة المندوب بنجاح',
        settingsSaved: 'تم حفظ الإعدادات',
        loginSuccess: 'تم تسجيل الدخول بنجاح',
        registerSuccess: 'تم التسجيل بنجاح',
        logoutSuccess: 'تم تسجيل الخروج',
        deleteConfirm: 'هل أنت متأكد من الحذف؟',
        passwordResetSent: 'تم إرسال رابط إعادة تعيين كلمة المرور',
        passwordsNotMatch: 'كلمتا المرور غير متطابقتين',
        agencyIdRequired: 'رقم الوكالة مطلوب للمناديب',
        maxAgentsReached: 'تم الوصول للحد الأقصى من المناديب في باقتك',
        emailExists: 'البريد الإلكتروني مسجل بالفعل',
        invalidCredentials: 'البريد أو كلمة المرور غير صحيحة',
        period: 'الفترة من 26 الشهر السابق حتى 25 هذا الشهر'
    },
    en: {
        login: 'Login', register: 'Create Account',
        welcome: 'Welcome to SalesHub Pro', createAccount: 'Create your account',
        noAccount: "Don't have an account? Sign up", hasAccount: 'Have an account? Login',
        forgotPass: 'Forgot password?', resetPass: 'Reset Password',
        sendReset: 'Send Reset Link', backToLogin: 'Back to Login',
        dashboard: 'Dashboard', agents: 'Agents', clients: 'Clients',
        reports: 'Reports', settings: 'Settings',
        notifications: 'Notifications', clearAll: 'Clear All',
        addAgent: 'Add Agent', editAgent: 'Edit Agent',
        addClient: 'Add Client', editClient: 'Edit Client',
        name: 'Name', email: 'Email', phone: 'Phone',
        address: 'Address', package: 'Package', status: 'Status',
        commission: 'Commission', salary: 'Salary', total: 'Total',
        save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
        active: 'Active', inactive: 'Inactive', warning: 'Warning',
        aboutUs: 'About Us', contactUs: 'Contact Us', privacy: 'Privacy Policy',
        terms: 'Terms & Conditions', refund: 'Refund & Replacement Policy',
        freePlan: 'Free', basicPlan: 'Basic', proPlan: 'Pro',
        businessPlan: 'Business', enterprisePlan: 'Enterprise',
        admin: 'Admin', agent: 'Agent', agencyId: 'Agency ID',
        noData: 'No data available', loading: 'Loading...',
        phoneInvalid: 'Invalid phone number',
        emailInvalid: 'Invalid email address',
        duplicateEmail: '⚠️ Duplicate client email detected',
        duplicatePhone: '⚠️ Duplicate client phone detected',
        clientAdded: 'Client added successfully',
        agentAdded: 'Agent added successfully',
        settingsSaved: 'Settings saved',
        loginSuccess: 'Login successful',
        registerSuccess: 'Registration successful',
        logoutSuccess: 'Logged out',
        deleteConfirm: 'Are you sure you want to delete?',
        passwordResetSent: 'Password reset link sent',
        passwordsNotMatch: 'Passwords do not match',
        agencyIdRequired: 'Agency ID is required for agents',
        maxAgentsReached: 'Maximum agents reached for your plan',
        emailExists: 'Email already registered',
        invalidCredentials: 'Invalid email or password',
        period: 'Period: 26th of last month to 25th of this month'
    }
};

function t(key) { return T[APP.lang][key] || key; }

// ===== Utilities =====
function generateId() { return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function generateAgencyId() { return 'AG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone, countryCode) {
    const len = phone.replace(/\D/g, '').length;
    const opt = document.querySelector(`option[value="${countryCode}"]`);
    const expected = opt ? parseInt(opt.dataset.len) : 8;
    return len === expected;
}

function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString(APP.lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function getPeriod() {
    const now = new Date();
    let startYear = now.getFullYear(), startMonth = now.getMonth() - 1;
    let endYear = now.getFullYear(), endMonth = now.getMonth();
    if (startMonth < 0) { startMonth = 11; startYear--; }
    return {
        start: new Date(startYear, startMonth, 26),
        end: new Date(endYear, endMonth, 25),
        label: `26/${startMonth + 1}/${startYear} - 25/${endMonth + 1}/${endYear}`
    };
}

function getPeriodClients(clients, agentId) {
    const p = getPeriod();
    return clients.filter(c => {
        const d = new Date(c.date);
        return (!agentId || c.agentId === agentId) && d >= p.start && d <= p.end;
    });
}

// ===== Toast Notifications =====
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><span class="toast-text">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-100%)'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ===== Modal =====
function openModal(title, body, footer) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer || '';
    document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }

// ===== Theme Toggle =====
function toggleTheme() {
    APP.theme = APP.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', APP.theme);
    const icon = document.querySelector('#themeToggle i');
    icon.className = APP.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('shp_theme', APP.theme);
    if (APP.charts.agents) renderCharts();
}

// ===== Language Toggle =====
function toggleLang() {
    APP.lang = APP.lang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = APP.lang;
    document.documentElement.dir = APP.lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('shp_lang', APP.lang);
    updateUI();
    if (APP.currentUser) renderDashboard();
}

// ===== Password Toggle =====
function togglePass(id) {
    const inp = document.getElementById(id);
    inp.type = inp.type === 'password' ? 'text' : 'password';
    inp.parentElement.querySelector('.toggle-pass i').className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

// ===== Navigation =====
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const el = document.getElementById(page + 'Page') || document.getElementById(page + 'Dashboard');
    if (el) { el.classList.remove('hidden'); APP.currentPage = page; }
    // Legal pages
    const legalPages = ['privacy', 'terms', 'refund', 'about', 'contact', 'adsense', 'googleplay', 'appstore'];
    if (legalPages.includes(page)) {
        document.getElementById(page + 'Page').classList.remove('hidden');
        renderLegalPage(page);
    }
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'privacy' || page === 'terms' || page === 'refund' || page === 'about' || page === 'contact' || page === 'adsense' || page === 'googleplay' || page === 'appstore') {
        document.getElementById('mainNav').classList.remove('hidden');
        document.getElementById('mainFooter').classList.remove('hidden');
    }
}

function renderNav() {
    const nav = document.getElementById('navLinks');
    if (!APP.currentUser) { nav.innerHTML = ''; return; }
    const role = APP.currentUser.role;
    let links = '';
    if (role === 'admin') {
        links = `
            <a href="#" data-page="admin" onclick="navigate('admin')"><i class="fas fa-tachometer-alt"></i> ${t('dashboard')}</a>
        `;
    } else {
        links = `
            <a href="#" data-page="agent" onclick="navigate('agent')"><i class="fas fa-tachometer-alt"></i> ${t('dashboard')}</a>
        `;
    }
    nav.innerHTML = links;
}

// ===== UI Updates =====
function updateUI() {
    document.getElementById('notifTitle').textContent = t('notifications');
    document.getElementById('clearNotifs').textContent = t('clearAll');
    renderNav();
}

// ===== Auth Logic =====
let authMode = 'login'; // login, register, forgot

function setupAuth() {
    const form = document.getElementById('authForm');
    const toggleLink = document.getElementById('toggleAuthMode');
    const forgotLink = document.getElementById('forgotPassLink');
    const roleRadios = document.querySelectorAll('input[name="regRole"]');

    roleRadios.forEach(r => r.addEventListener('change', () => {
        document.getElementById('agencyIdGroup').classList.toggle('hidden', r.value !== 'agent');
    }));

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (authMode === 'login') setAuthMode('register');
        else if (authMode === 'register') setAuthMode('login');
        else setAuthMode('login');
    });

    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('forgot');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (authMode === 'login') handleLogin();
        else if (authMode === 'register') handleRegister();
        else handleForgot();
    });
}

function setAuthMode(mode) {
    authMode = mode;
    const loginFields = document.getElementById('loginFields');
    const registerFields = document.getElementById('registerFields');
    const forgotFields = document.getElementById('forgotFields');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authBtn = document.getElementById('authBtnText');
    const toggleLink = document.getElementById('toggleAuthMode');
    const forgotLink = document.getElementById('forgotPassLink');

    loginFields.classList.add('hidden');
    registerFields.classList.add('hidden');
    forgotFields.classList.add('hidden');
    forgotLink.classList.remove('hidden');

    if (mode === 'login') {
        loginFields.classList.remove('hidden');
        authTitle.textContent = t('login');
        authSubtitle.textContent = t('welcome');
        authBtn.textContent = t('login');
        toggleLink.textContent = t('noAccount');
    } else if (mode === 'register') {
        registerFields.classList.remove('hidden');
        authTitle.textContent = t('register');
        authSubtitle.textContent = t('createAccount');
        authBtn.textContent = t('register');
        toggleLink.textContent = t('hasAccount');
    } else {
        forgotFields.classList.remove('hidden');
        authTitle.textContent = t('resetPass');
        authSubtitle.textContent = t('forgotPass');
        authBtn.textContent = t('sendReset');
        toggleLink.textContent = t('backToLogin');
        forgotLink.classList.add('hidden');
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    const data = DB.getAll();
    const user = data.users.find(u => u.email === email && u.password === pass);
    if (!user) { showToast(t('invalidCredentials'), 'error'); return; }
    APP.currentUser = user;
    DB.set('currentUser', user);
    showToast(t('loginSuccess'), 'success');
    postLogin();
}

function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const cc = document.getElementById('regCountryCode').value;
    const pass = document.getElementById('regPass').value;
    const confirm = document.getElementById('regPassConfirm').value;
    const role = document.querySelector('input[name="regRole"]:checked').value;
    const agencyId = document.getElementById('agencyIdInput').value.trim();

    if (!validateEmail(email)) { showToast(t('emailInvalid'), 'error'); return; }
    if (!validatePhone(phone, cc)) { showToast(t('phoneInvalid'), 'error'); return; }
    if (pass.length < 6) { showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error'); return; }
    if (pass !== confirm) { showToast(t('passwordsNotMatch'), 'error'); return; }

    const data = DB.getAll();
    if (data.users.find(u => u.email === email)) { showToast(t('emailExists'), 'error'); return; }

    let userAgencyId = null;
    let linkedAdminId = null;

    if (role === 'agent') {
        if (!agencyId) { showToast(t('agencyIdRequired'), 'error'); return; }
        const admin = data.users.find(u => u.role === 'admin' && u.agencyId === agencyId);
        if (!admin) { showToast('رقم الوكالة غير صحيح', 'error'); return; }
        // Check plan limits
        const agentCount = data.users.filter(u => u.role === 'agent' && u.adminId === admin.id).length;
        const plan = getPlanLimits(admin.plan || 'free');
        if (plan !== -1 && agentCount >= plan) { showToast(t('maxAgentsReached'), 'error'); return; }
        linkedAdminId = admin.id;
        userAgencyId = agencyId;
    } else {
        userAgencyId = generateAgencyId();
    }

    const user = {
        id: generateId(), name, email, phone: '+' + cc + phone,
        password: pass, role, agencyId: userAgencyId,
        adminId: linkedAdminId, plan: role === 'admin' ? 'free' : null,
        status: 'active', createdAt: new Date().toISOString()
    };

    data.users.push(user);
    DB.set('users', data.users);

    if (role === 'agent' && linkedAdminId) {
        addNotification(linkedAdminId, 'info', 'مندوب جديد', `انضم ${name} كمندوب للوكالة`);
    }

    APP.currentUser = user;
    DB.set('currentUser', user);
    showToast(t('registerSuccess'), 'success');
    postLogin();
}

function handleForgot() {
    const email = document.getElementById('forgotEmail').value.trim();
    if (!validateEmail(email)) { showToast(t('emailInvalid'), 'error'); return; }
    const data = DB.getAll();
    const user = data.users.find(u => u.email === email);
    if (user) {
        // Simulate sending reset email
        showToast(t('passwordResetSent'), 'success');
    } else {
        showToast(t('passwordResetSent'), 'success'); // Don't reveal if email exists
    }
    setAuthMode('login');
}

function getPlanLimits(plan) {
    const limits = { free: 3, basic: 10, pro: 25, business: 60, enterprise: -1 };
    return limits[plan] || 3;
}

function postLogin() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('mainNav').classList.remove('hidden');
    document.getElementById('mainFooter').classList.remove('hidden');
    document.getElementById('notifBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    updateUI();
    renderDashboard();
    loadNotifications();
}

function handleLogout() {
    APP.currentUser = null;
    DB.del('currentUser');
    showToast(t('logoutSuccess'), 'info');
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('authPage').classList.remove('hidden');
    document.getElementById('mainNav').classList.add('hidden');
    document.getElementById('mainFooter').classList.add('hidden');
    document.getElementById('notifBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('navLinks').innerHTML = '';
    setAuthMode('login');
}

// ===== Notifications =====
function addNotification(userId, type, title, message) {
    const data = DB.getAll();
    data.notifications.push({
        id: generateId(), userId, type, title, message,
        read: false, date: new Date().toISOString()
    });
    DB.set('notifications', data.notifications);
    loadNotifications();
}

function loadNotifications() {
    if (!APP.currentUser) return;
    const data = DB.getAll();
    const notifs = data.notifications.filter(n => n.userId === APP.currentUser.id && !n.read);
    const badge = document.getElementById('notifBadge');
    badge.textContent = notifs.length;
    badge.style.display = notifs.length > 0 ? 'flex' : 'none';

    const list = document.getElementById('notifList');
    if (notifs.length === 0) {
        list.innerHTML = `<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>لا توجد إشعارات جديدة</p></div>`;
        return;
    }
    list.innerHTML = notifs.map(n => `
        <div class="notif-item" onclick="markNotifRead('${n.id}')">
            <div class="notif-icon ${n.type}"><i class="fas fa-${n.type === 'warning' ? 'exclamation-triangle' : n.type === 'success' ? 'check-circle' : 'info-circle'}"></i></div>
            <div class="notif-text">
                <h4>${n.title}</h4>
                <p>${n.message}</p>
                <div class="notif-time">${formatDate(n.date)}</div>
            </div>
        </div>
    `).join('');
}

function markNotifRead(id) {
    const data = DB.getAll();
    const n = data.notifications.find(x => x.id === id);
    if (n) { n.read = true; DB.set('notifications', data.notifications); loadNotifications(); }
}

function clearNotifications() {
    const data = DB.getAll();
    data.notifications = data.notifications.filter(n => n.userId !== APP.currentUser.id);
    DB.set('notifications', data.notifications);
    loadNotifications();
}

// ===== Dashboard Render =====
function renderDashboard() {
    if (!APP.currentUser) return;
    if (APP.currentUser.role === 'admin') renderAdminDashboard();
    else renderAgentDashboard();
}

// ===== Admin Dashboard =====
function renderAdminDashboard() {
    navigate('admin');
    const data = DB.getAll();
    const adminId = APP.currentUser.id;
    const agents = data.users.filter(u => u.role === 'agent' && u.adminId === adminId);
    const allClients = data.clients.filter(c => {
        const agent = data.users.find(u => u.id === c.agentId);
        return agent && agent.adminId === adminId;
    });
    const periodClients = getPeriodClients(allClients);

    // Settings
    document.getElementById('baseSalary').value = data.settings.baseSalary;
    document.getElementById('freeClientComm').value = data.settings.freeClientComm;
    document.getElementById('pkg10Comm').value = data.settings.pkg10Comm;
    document.getElementById('pkg25Comm').value = data.settings.pkg25Comm;
    document.getElementById('pkg60Comm').value = data.settings.pkg60Comm;
    document.getElementById('pkgUnlimitedComm').value = data.settings.pkgUnlimitedComm;

    // Stats
    const statsHTML = `
        <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-users"></i></div>
            <div class="stat-info"><h3>${agents.length}</h3><p>إجمالي المناديب</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-address-book"></i></div>
            <div class="stat-info"><h3>${allClients.length}</h3><p>إجمالي العملاء</p></div></div>
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-user-check"></i></div>
            <div class="stat-info"><h3>${periodClients.length}</h3><p>عملاء هذه الفترة</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-money-bill-wave"></i></div>
            <div class="stat-info"><h3>${calcTotalCommissions(agents, allClients).toLocaleString()} ج</h3><p>إجمالي العمولات</p></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="stat-info"><h3>${findDuplicates(allClients).length}</h3><p>تحذيرات</p></div></div>
    `;
    document.getElementById('adminStats').innerHTML = statsHTML;

    // Agents Table
    const tbody = document.getElementById('agentsTableBody');
    tbody.innerHTML = agents.length ? agents.map((a, i) => {
        const agentClients = allClients.filter(c => c.agentId === a.id);
        const pc = getPeriodClients(allClients, a.id);
        const comm = calcAgentCommission(pc, data.settings);
        return `<tr>
            <td>${i + 1}</td>
            <td>${a.name}</td>
            <td>${a.email}</td>
            <td>${a.phone}</td>
            <td>${agentClients.length}</td>
            <td>${comm.toLocaleString()} ج</td>
            <td>${data.settings.baseSalary.toLocaleString()} ج</td>
            <td><span class="badge ${a.status === 'active' ? 'badge-success' : 'badge-danger'}">${a.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
            <td class="actions">
                <button class="btn-icon" onclick="editAgent('${a.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="toggleAgentStatus('${a.id}')" title="حالة"><i class="fas fa-toggle-${a.status === 'active' ? 'on' : 'off'}"></i></button>
                <button class="btn-icon" onclick="deleteAgent('${a.id}')" title="حذف"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('') : `<tr><td colspan="9" style="text-align:center">${t('noData')}</td></tr>`;

    // All Clients Table
    renderAllClients(allClients, agents);

    // Warnings
    renderWarnings(allClients, agents);

    // Salary Report
    renderSalaryReport(agents, allClients, data.settings);

    // Charts
    renderCharts(agents, allClients, data.settings);
}

function renderAllClients(clients, agents) {
    const tbody = document.getElementById('allClientsBody');
    const pkgNames = { free: 'مجاني', '10': 'باقة 10', '25': 'باقة 25', '60': 'باقة 60', unlimited: 'غير محدود' };
    tbody.innerHTML = clients.length ? clients.map((c, i) => {
        const agent = agents.find(a => a.id === c.agentId);
        return `<tr>
            <td>${i + 1}</td>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.address}</td>
            <td><span class="badge badge-primary">${pkgNames[c.package] || c.package}</span></td>
            <td>${agent ? agent.name : '-'}</td>
            <td>${formatDate(c.date)}</td>
        </tr>`;
    }).join('') : `<tr><td colspan="8" style="text-align:center">${t('noData')}</td></tr>`;
}

function findDuplicates(clients) {
    const dupes = [];
    const emailMap = {}, phoneMap = {};
    clients.forEach(c => {
        if (emailMap[c.email]) dupes.push({ type: 'email', value: c.email, clients: [emailMap[c.email], c] });
        else emailMap[c.email] = c;
        if (phoneMap[c.phone]) dupes.push({ type: 'phone', value: c.phone, clients: [phoneMap[c.phone], c] });
        else phoneMap[c.phone] = c;
    });
    return dupes;
}

function renderWarnings(clients, agents) {
    const dupes = findDuplicates(clients);
    const list = document.getElementById('warningsList');
    const card = document.getElementById('warningsCard');
    if (dupes.length === 0) {
        card.classList.add('hidden');
        return;
    }
    card.classList.remove('hidden');
    list.innerHTML = dupes.map(d => {
        const agentNames = d.clients.map(c => {
            const a = agents.find(x => x.id === c.agentId);
            return a ? a.name : 'غير معروف';
        });
        return `<div class="warning-item">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="warn-info">
                <h4>${d.type === 'email' ? t('duplicateEmail') : t('duplicatePhone')}</h4>
                <p>${d.value} — المناديب: ${agentNames.join(', ')}</p>
            </div>
        </div>`;
    }).join('');

    // Send warning notifications to admin
    const data = DB.getAll();
    dupes.forEach(d => {
        d.clients.forEach(c => {
            const agent = agents.find(a => a.id === c.agentId);
            if (agent) {
                addNotification(APP.currentUser.id, 'warning',
                    d.type === 'email' ? 'بريد مكرر' : 'موبايل مكرر',
                    `المندوب ${agent.name} — ${d.type === 'email' ? 'البريد' : 'الموبايل'}: ${d.value}`
                );
            }
        });
    });
}

function calcAgentCommission(clients, settings) {
    let total = 0;
    clients.forEach(c => {
        switch (c.package) {
            case 'free': total += settings.freeClientComm; break;
            case '10': total += settings.pkg10Comm; break;
            case '25': total += settings.pkg25Comm; break;
            case '60': total += settings.pkg60Comm; break;
            case 'unlimited': total += settings.pkgUnlimitedComm; break;
        }
    });
    return total;
}

function calcTotalCommissions(agents, clients) {
    const data = DB.getAll();
    const period = getPeriod();
    let total = 0;
    agents.forEach(a => {
        const pc = getPeriodClients(clients, a.id);
        total += calcAgentCommission(pc, data.settings);
    });
    return total;
}

function renderSalaryReport(agents, clients, settings) {
    const period = getPeriod();
    document.getElementById('reportPeriod').textContent = period.label;
    const tbody = document.getElementById('salaryBody');
    tbody.innerHTML = agents.length ? agents.map(a => {
        const pc = getPeriodClients(clients, a.id);
        const counts = { free: 0, '10': 0, '25': 0, '60': 0, unlimited: 0 };
        pc.forEach(c => { if (counts[c.package] !== undefined) counts[c.package]++; });
        const comm = calcAgentCommission(pc, settings);
        const net = settings.baseSalary + comm;
        return `<tr>
            <td>${a.name}</td>
            <td>${counts.free}</td>
            <td>${counts['10']}</td>
            <td>${counts['25']}</td>
            <td>${counts['60']}</td>
            <td>${counts.unlimited}</td>
            <td>${comm.toLocaleString()} ج</td>
            <td>${settings.baseSalary.toLocaleString()} ج</td>
            <td><strong>${net.toLocaleString()} ج</strong></td>
        </tr>`;
    }).join('') : `<tr><td colspan="9" style="text-align:center">${t('noData')}</td></tr>`;
}

function renderCharts(agents, clients, settings) {
    const chartColors = ['#6C63FF', '#2ED573', '#FFA502', '#FF6B6B', '#1E90FF'];
    const chartBg = APP.theme === 'dark' ? '#1A1A2E' : '#fff';
    const textColor = APP.theme === 'dark' ? '#E8E8E8' : '#2C3E50';

    // Agents Performance Chart
    if (APP.charts.agents) APP.charts.agents.destroy();
    const agentsCtx = document.getElementById('agentsChart');
    if (agentsCtx) {
        APP.charts.agents = new Chart(agentsCtx, {
            type: 'bar',
            data: {
                labels: agents.map(a => a.name),
                datasets: [{
                    label: 'العملاء',
                    data: agents.map(a => clients.filter(c => c.agentId === a.id).length),
                    backgroundColor: chartColors,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { color: textColor }, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { ticks: { color: textColor } }
                }
            }
        });
    }

    // Packages Distribution Chart
    if (APP.charts.packages) APP.charts.packages.destroy();
    const pkgCtx = document.getElementById('packagesChart');
    if (pkgCtx) {
        const counts = { free: 0, '10': 0, '25': 0, '60': 0, unlimited: 0 };
        clients.forEach(c => { if (counts[c.package] !== undefined) counts[c.package]++; });
        APP.charts.packages = new Chart(pkgCtx, {
            type: 'doughnut',
            data: {
                labels: ['مجاني', 'باقة 10', 'باقة 25', 'باقة 60', 'غير محدود'],
                datasets: [{
                    data: Object.values(counts),
                    backgroundColor: chartColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, padding: 16, font: { family: 'Cairo' } }
                    }
                }
            }
        });
    }
}

// ===== Agent CRUD =====
function editAgent(id) {
    const data = DB.getAll();
    const agent = data.users.find(u => u.id === id);
    if (!agent) return;
    openModal(t('editAgent'), `
        <div class="form-group"><label>${t('name')}</label><input type="text" id="editAgentName" class="form-control" value="${agent.name}"></div>
        <div class="form-group"><label>${t('email')}</label><input type="email" id="editAgentEmail" class="form-control" value="${agent.email}"></div>
        <div class="form-group"><label>${t('phone')}</label><input type="tel" id="editAgentPhone" class="form-control" value="${agent.phone}"></div>
    `, `<button class="btn btn-primary" onclick="saveAgentEdit('${id}')"><i class="fas fa-save"></i> ${t('save')}</button>
        <button class="btn btn-secondary" onclick="closeModal()">${t('cancel')}</button>`);
}

function saveAgentEdit(id) {
    const data = DB.getAll();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx === -1) return;
    data.users[idx].name = document.getElementById('editAgentName').value;
    data.users[idx].email = document.getElementById('editAgentEmail').value;
    data.users[idx].phone = document.getElementById('editAgentPhone').value;
    DB.set('users', data.users);
    closeModal();
    showToast('تم تحديث بيانات المندوب', 'success');
    renderDashboard();
}

function toggleAgentStatus(id) {
    const data = DB.getAll();
    const agent = data.users.find(u => u.id === id);
    if (!agent) return;
    agent.status = agent.status === 'active' ? 'inactive' : 'active';
    DB.set('users', data.users);
    showToast('تم تحديث حالة المندوب', 'success');
    renderDashboard();
}

function deleteAgent(id) {
    openModal(t('deleteConfirm'), '<p>سيتم حذف المندوب وجميع بياناته نهائياً.</p>',
        `<button class="btn btn-danger" onclick="confirmDeleteAgent('${id}')"><i class="fas fa-trash"></i> ${t('delete')}</button>
         <button class="btn btn-secondary" onclick="closeModal()">${t('cancel')}</button>`);
}

function confirmDeleteAgent(id) {
    const data = DB.getAll();
    data.users = data.users.filter(u => u.id !== id);
    data.clients = data.clients.filter(c => c.agentId !== id);
    DB.saveAll(data);
    closeModal();
    showToast('تم حذف المندوب', 'success');
    renderDashboard();
}

// ===== Settings =====
function saveSettings() {
    const data = DB.getAll();
    data.settings = {
        baseSalary: parseInt(document.getElementById('baseSalary').value) || 0,
        freeClientComm: parseInt(document.getElementById('freeClientComm').value) || 0,
        pkg10Comm: parseInt(document.getElementById('pkg10Comm').value) || 0,
        pkg25Comm: parseInt(document.getElementById('pkg25Comm').value) || 0,
        pkg60Comm: parseInt(document.getElementById('pkg60Comm').value) || 0,
        pkgUnlimitedComm: parseInt(document.getElementById('pkgUnlimitedComm').value) || 0,
    };
    DB.set('settings', data.settings);
    showToast(t('settingsSaved'), 'success');
    renderDashboard();
}

// ===== Agent Dashboard =====
function renderAgentDashboard() {
    navigate('agent');
    const data = DB.getAll();
    const agent = APP.currentUser;
    const clients = data.clients.filter(c => c.agentId === agent.id);
    const periodClients = getPeriodClients(clients);
    const settings = data.settings;
    const comm = calcAgentCommission(periodClients, settings);
    const net = settings.baseSalary + comm;
    const period = getPeriod();

    // Agent info
    document.getElementById('agentInfo').innerHTML = `
        <span class="agency-badge">${t('agencyId')}: ${agent.agencyId}</span>
    `;

    // Stats
    document.getElementById('agentStats').innerHTML = `
        <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-users"></i></div>
            <div class="stat-info"><h3>${clients.length}</h3><p>إجمالي عملائي</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-user-check"></i></div>
            <div class="stat-info"><h3>${periodClients.length}</h3><p>عملاء هذه الفترة</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-coins"></i></div>
            <div class="stat-info"><h3>${comm.toLocaleString()} ج</h3><p>عمولتي</p></div></div>
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-wallet"></i></div>
            <div class="stat-info"><h3>${net.toLocaleString()} ج</h3><p>صافي الراتب</p></div></div>
    `;

    // My clients
    const pkgNames = { free: 'مجاني', '10': 'باقة 10', '25': 'باقة 25', '60': 'باقة 60', unlimited: 'غير محدود' };
    const tbody = document.getElementById('myClientsBody');
    tbody.innerHTML = clients.length ? clients.map((c, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.address}</td>
            <td><span class="badge badge-primary">${pkgNames[c.package] || c.package}</span></td>
            <td>${formatDate(c.date)}</td>
        </tr>
    `).join('') : `<tr><td colspan="7" style="text-align:center">${t('noData')}</td></tr>`;

    // Salary
    document.getElementById('agentReportPeriod').textContent = period.label;
    const counts = { free: 0, '10': 0, '25': 0, '60': 0, unlimited: 0 };
    periodClients.forEach(c => { if (counts[c.package] !== undefined) counts[c.package]++; });

    document.getElementById('mySalarySummary').innerHTML = `
        <div class="salary-card"><h4>عملاء مجاني</h4><div class="amount">${counts.free}</div></div>
        <div class="salary-card"><h4>باقة 10</h4><div class="amount">${counts['10']}</div></div>
        <div class="salary-card"><h4>باقة 25</h4><div class="amount">${counts['25']}</div></div>
        <div class="salary-card"><h4>باقة 60</h4><div class="amount">${counts['60']}</div></div>
        <div class="salary-card"><h4>غير محدود</h4><div class="amount">${counts.unlimited}</div></div>
        <div class="salary-card"><h4>العمولة</h4><div class="amount">${comm.toLocaleString()} ج</div></div>
        <div class="salary-card"><h4>الراتب الأساسي</h4><div class="amount">${settings.baseSalary.toLocaleString()} ج</div></div>
        <div class="salary-card total"><h4>صافي الراتب</h4><div class="amount">${net.toLocaleString()} ج</div></div>
    `;
}

// ===== Add Client (Agent) =====
function setupClientForm() {
    const form = document.getElementById('addClientForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('clientName').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
        const cc = document.getElementById('clientCountryCode').value;
        const address = document.getElementById('clientAddress').value.trim();
        const pkg = document.getElementById('clientPackage').value;

        if (!validateEmail(email)) { showToast(t('emailInvalid'), 'error'); return; }
        if (!validatePhone(phone, cc)) { showToast(t('phoneInvalid'), 'error'); return; }

        const data = DB.getAll();
        const fullPhone = '+' + cc + phone;

        // Duplicate check
        const existingEmail = data.clients.find(c => c.email === email);
        const existingPhone = data.clients.find(c => c.phone === fullPhone);

        if (existingEmail || existingPhone) {
            const admin = data.users.find(u => u.id === APP.currentUser.adminId);
            if (admin) {
                if (existingEmail) addNotification(admin.id, 'warning', 'بريد إلكتروني مكرر', `المندوب ${APP.currentUser.name} — البريد: ${email} — العميل: ${name}`);
                if (existingPhone) addNotification(admin.id, 'warning', 'رقم موبايل مكرر', `المندوب ${APP.currentUser.name} — الموبايل: ${fullPhone} — العميل: ${name}`);
            }
        }

        const client = {
            id: generateId(), name, email, phone: fullPhone,
            address, package: pkg, agentId: APP.currentUser.id,
            date: new Date().toISOString()
        };

        data.clients.push(client);
        DB.set('clients', data.clients);
        showToast(t('clientAdded'), 'success');
        form.reset();
        renderDashboard();
    });
}

// ===== Legal Pages =====
function renderLegalPage(page) {
    const pages = {
        privacy: `
            <h1>سياسة الخصوصية — SalesHub Pro</h1>
            <p class="highlight">آخر تحديث: أبريل 2026</p>
            <h2>1. المعلومات التي نجمعها</h2>
            <p>نقوم بجمع المعلومات التي تقدمها مباشرة عند إنشاء حسابك، بما في ذلك الاسم، البريد الإلكتروني، رقم الهاتف، ومعلومات المندوبين والعملاء.</p>
            <h2>2. كيفية استخدام المعلومات</h2>
            <ul>
                <li>تقديم وتحسين خدمات إدارة المبيعات</li>
                <li>حساب الرواتب والعمولات</li>
                <li>إرسال إشعارات نظام مهمة</li>
                <li>تحليل أداء المناديب وإعداد التقارير</li>
            </ul>
            <h2>3. مشاركة المعلومات مع أطراف ثالثة</h2>
            <p>قد نشارك بياناتك مع:</p>
            <ul>
                <li><strong>خدمات Google AdSense:</strong> لعرض إعلانات مناسبة لاهتماماتك</li>
                <li><strong>ملفات تعريف الارتباط (Cookies):</strong> نستخدمها لتحسين تجربتك وتذكر تفضيلاتك</li>
                <li><strong>خدمات التحليلات:</strong> مثل Google Analytics لفهم سلوك المستخدمين</li>
                <li><strong>مزودي الخدمات:</strong> الذين يساعدوننا في تشغيل المنصة (استضافة، دعم فني)</li>
            </ul>
            <h2>4. خصوصية الأطفال</h2>
            <div class="highlight">
                <p>تطبيقنا غير مخصص للأطفال دون سن 13 عاماً. نحن لا نجمع بيانات شخصية من الأطفال عمداً. إذا علمنا أن طفلاً قد قدم لنا معلومات شخصية، فسنقوم بحذفها فوراً.</p>
            </div>
            <h2>5. ملفات تعريف الارتباط (Cookies)</h2>
            <p>نستخدم ملفات تعريف الارتباط ل:</p>
            <ul>
                <li>تذكر تسجيل دخولك وتفضيلاتك</li>
                <li>تحليل حركة المرور على الموقع</li>
                <li>تخصيص المحتوى والإعلانات</li>
            </ul>
            <p>يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.</p>
            <h2>6. أمان البيانات</h2>
            <p>نتخذ إجراءات أمنية معقولة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح.</p>
            <h2>7. حقوقك</h2>
            <ul>
                <li>الوصول إلى بياناتك الشخصية</li>
                <li>تصحيح أي بيانات غير دقيقة</li>
                <li>طلب حذف بياناتك</li>
                <li>الاعتراض على معالجة بياناتك</li>
            </ul>
            <h2>8. الاحتفاظ بالبيانات</h2>
            <p>نحتفظ ببياناتك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. قد نحتفظ ببعض البيانات للامتثال للالتزامات القانونية.</p>
            <h2>9. التغييرات على هذه السياسة</h2>
            <p>قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة.</p>
            <h2>10. اتصل بنا</h2>
            <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا على: emadh5156@gmail.com</p>
        `,
        terms: `
            <h1>الشروط والأحكام — SalesHub Pro</h1>
            <p class="highlight">آخر تحديث: أبريل 2026</p>
            <h2>شروط Google Play (15 شرط)</h2>
            <ol>
                <li>يجب أن يكون التطبيق متوافقاً مع جميع سياسات Google Play</li>
                <li>عدم تضمين أي محتوى ضار أو مضلل</li>
                <li>حماية بيانات المستخدم وفقاً لسياسة الخصوصية</li>
                <li>عدم جمع بيانات غير ضرورية</li>
                <li>تقديم وصف دقيق للتطبيق والميزات</li>
                <li>عدم استخدام العلامات التجارية بشكل مضلل</li>
                <li>الامتثال لقوانين حماية البيانات المعمول بها</li>
                <li>عدم إرسال إشعارات غير مرغوب فيها (Spam)</li>
                <li>توفير طريقة واضحة للتواصل والدعم</li>
                <li>عدم استخدام صلاحيات الجهاز بشكل مفرط</li>
                <li>ضمان توافق التطبيق مع إصدارات Android المدعومة</li>
                <li>عدم تضمين برمجيات خبيثة أو تجسسية</li>
                <li>الالتزام بمعايير جودة Google Play</li>
                <li>توفير تجربة مستخدم سلسة ومستقرة</li>
                <li>التحديث الدوري لمعالجة الثغرات الأمنية</li>
            </ol>
            <h2>شروط App Store (15 شرط)</h2>
            <ol>
                <li>الامتثال لجميع إرشادات مراجعة تطبيقات Apple</li>
                <li>عدم تضمين محتوى غير لائق أو مسيء</li>
                <li>حماية خصوصية المستخدم وفقاً لمعايير Apple</li>
                <li>عدم جمع بيانات الموقع دون إذن صريح</li>
                <li>تقديم تجربة مستخدم متسقة مع مبادئ Apple للتصميم</li>
                <li>عدم استخدام واجهات برمجية خاصة (Private APIs)</li>
                <li>التوافق مع إصدارات iOS المدعومة</li>
                <li>عدم انتهاك حقوق الملكية الفكرية</li>
                <li>توضيح نموذج الاشتراك والأسعار بوضوح</li>
                <li>توفير إمكانية إلغاء الاشتراك بسهولة</li>
                <li>عدم إرسال إشعارات ترويجية دون إذن</li>
                <li>ضمان استقرار الأداء وعدم حدوث تجمد</li>
                <li>عدم تضمين أي آليات لدفع العمليات خارج التطبيق</li>
                <li>الامتثال لقوانين التصدير والتجارة الدولية</li>
                <li>توفير محتوى مناسب لجميع الفئات العمرية</li>
            </ol>
            <h2>شروط الاستخدام العامة</h2>
            <h3>1. القبول</h3>
            <p>باستخدام SalesHub Pro، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
            <h3>2. الاستخدام المسموح</h3>
            <p>يُسمح لك باستخدام الخدمة لأغراض تجارية مشروعة فقط.</p>
            <h3>3. الحسابات</h3>
            <p>أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك.</p>
            <h3>4. الاشتراكات والدفع</h3>
            <p>تُدفع الاشتراكات الشهرية مقدماً. يتم تجديد الاشتراك تلقائياً ما لم يتم الإلغاء.</p>
            <h3>5. الملكية الفكرية</h3>
            <p>جميع حقوق الملكية الفكرية في الخدمة مملوكة لـ SalesHub Pro.</p>
            <h3>6. إخلاء المسؤولية</h3>
            <p>تُقدم الخدمة "كما هي" دون أي ضمانات صريحة أو ضمنية.</p>
            <h3>7. تحديد المسؤولية</h3>
            <p>لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الخدمة.</p>
            <h3>8. التعديلات</h3>
            <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت مع إشعار مسبق.</p>
            <h3>9. القانون الحاكم</h3>
            <p>تخضع هذه الشروط لقوانين جمهورية مصر العربية.</p>
            <h3>10. حل النزاعات</h3>
            <p>أي نزاع ينشأ عن هذه الشروط يتم حله عبر المحاكم المختصة في القاهرة.</p>
        `,
        refund: `
            <h1>سياسة الاسترجاع والاستبدال</h1>
            <p class="highlight">SalesHub Pro — أبريل 2026</p>
            <h2>1. الاسترجاع</h2>
            <p>يمكنك طلب استرجاع المبلغ خلال 14 يوماً من تاريخ الاشتراك شريطة عدم استخدام الخدمة بشكل مكثف.</p>
            <h2>2. شروط الاسترجاع</h2>
            <ul>
                <li>أن يكون الطلب خلال 14 يوماً من تاريخ الدفع</li>
                <li>تقديم سبب واضح لطلب الاسترجاع</li>
                <li>عدم تجاوز عدد محدد من المعاملات أثناء فترة الاشتراك</li>
            </ul>
            <h2>3. الاستبدال</h2>
            <p>في حالة وجود مشكلة تقنية في الخدمة، نقدم:</p>
            <ul>
                <li>تمديد فترة الاشتراك مجاناً</li>
                <li>ترقية الباقة مؤقتاً</li>
                <li>حل تقني للمشكلة خلال 48 ساعة</li>
            </ul>
            <h2>4. كيفية الطلب</h2>
            <p>أرسل طلبك إلى: emadh5156@gmail.com مع ذكر رقم الاشتراك وسبب الطلب.</p>
            <h2>5. مدة المعالجة</h2>
            <p>تتم معالجة طلبات الاسترجاع خلال 5-10 أيام عمل.</p>
            <h2>6. حالات الرفض</h2>
            <ul>
                <li>تجاوز مهلة 14 يوماً</li>
                <li>استخدام الخدمة بشكل مكثف</li>
                <li>انتهاك شروط الاستخدام</li>
            </ul>
        `,
        about: `
            <h1>من نحن — SalesHub Pro</h1>
            <h2>رسالتنا</h2>
            <div class="highlight">
                <p>تمكين الشركات والمؤسسات من إدارة فرق المبيعات بكفاءة وشفافية عالية، من خلال منصة ذكية تجمع بين سهولة الاستخدام وقوة التحليل.</p>
            </div>
            <h2>رؤيتنا</h2>
            <p>أن نكون المنصة الرائدة في إدارة المبيعات بالشرق الأوسط، نساعد آلاف الشركات على تحقيق أهدافها البيعية.</p>
            <h2>إحصائياتنا</h2>
            <ul>
                <li><strong>+500</strong> شركة تثق بنا</li>
                <li><strong>+5,000</strong> مندوب مبيعات نشط</li>
                <li><strong>+100,000</strong> عميل تم تسجيله</li>
                <li><strong>99.9%</strong> وقت تشغيل للنظام</li>
            </ul>
            <h2>قيمنا</h2>
            <ul>
                <li><strong>الشفافية:</strong> نؤمن بالوضوح في كل معاملاتنا</li>
                <li><strong>الابتكار:</strong> نطور باستمرار لتقديم الأفضل</li>
                <li><strong>الموثوقية:</strong> نظامنا متاح 24/7</li>
                <li><strong>خدمة العملاء:</strong> فريقنا جاهز لمساعدتك دائماً</li>
            </ul>
        `,
        contact: `
            <h1>اتصل بنا</h1>
            <p>يسعدنا تلقي استفساراتك واقتراحاتك. فريقنا جاهز للمساعدة!</p>
            <div class="highlight">
                <h3>📧 البريد الإلكتروني</h3>
                <p>emadh5156@gmail.com</p>
            </div>
            <h2>نموذج التواصل</h2>
            <div class="form-group"><label>الاسم الكامل</label><input type="text" class="form-control" placeholder="اسمك"></div>
            <div class="form-group"><label>البريد الإلكتروني</label><input type="email" class="form-control" placeholder="بريدك"></div>
            <div class="form-group"><label>الموضوع</label><input type="text" class="form-control" placeholder="موضوع الرسالة"></div>
            <div class="form-group"><label>الرسالة</label><textarea class="form-control" rows="5" placeholder="اكتب رسالتك هنا..."></textarea></div>
            <button class="btn btn-primary" onclick="handleContactForm()"><i class="fas fa-paper-plane"></i> إرسال الرسالة</button>
            <h2 style="margin-top:32px">ساعات العمل</h2>
            <p>الأحد - الخميس: 9:00 ص - 6:00 م (بتوقيت القاهرة)</p>
            <p>الجمعة والسبت: مغلق</p>
        `,
        adsense: `
            <h1>سياسة الإعلانات (AdSense)</h1>
            <p class="highlight">SalesHub Pro — أبريل 2026</p>
            <h2>شروط Google AdSense (11 شرط)</h2>
            <ol>
                <li>عدم النقر على إعلاناتك الخاصة</li>
                <li>عدم تشجيع المستخدمين على النقر على الإعلانات</li>
                <li>عدم تعديل كود الإعلانات</li>
                <li>عدم وضع إعلانات على صفحات بدون محتوى</li>
                <li>عدم استخدام محتوى محمي بحقوق النشر</li>
                <li>عدم وضع إعلانات على صفحات تحتوي على برمجيات خبيثة</li>
                <li>عدم إخفاء الإعلانات أو تغطيتها</li>
                <li>الامتثال لسياسات المحتوى Google</li>
                <li>عدم عرض إعلانات في نوافذ منبثقة</li>
                <li>عدم التلاعب بمعدلات النقر (CTR)</li>
                <li>الحفاظ على نسبة معقولة من المحتوى مقابل الإعلانات</li>
            </ol>
            <h2>ملفات تعريف الارتباط والإعلانات</h2>
            <p>يستخدم Google AdSense ملفات تعريف الارتباط لعرض إعلانات مبنية على زياراتك السابقة لمواقعنا ومواقع أخرى على الإنترنت.</p>
            <h2>خدمات أطراف ثالثة</h2>
            <ul>
                <li>Google AdSense لعرض الإعلانات</li>
                <li>Google Analytics لتحليلات الموقع</li>
                <li>خدمات CDN لتسريع التحميل</li>
            </ul>
            <h2>اختيارات المستخدم</h2>
            <p>يمكنك إلغاء الاشتراك في الإعلانات المخصصة من خلال <a href="https://www.google.com/settings/ads" target="_blank">إعدادات إعلانات Google</a>.</p>
        `,
        googleplay: `
            <h1>شروط Google Play</h1>
            <p class="highlight">SalesHub Pro — أبريل 2026</p>
            <h2>سياسة المحتوى</h2>
            <p>يلتزم SalesHub Pro بجميع سياسات محتوى Google Play开发者.</p>
            <h2>الصلاحيات</h2>
            <ul>
                <li>الإنترنت: للتزامن والبيانات</li>
                <li>الإشعارات: لإشعارات النظام</li>
                <li>التخزين: لحفظ البيانات محلياً</li>
            </ul>
            <h2>المشتريات داخل التطبيق</h2>
            <p>تتم جميع عمليات الاشتراك عبر نظام فوترة Google Play.</p>
            <h2>سياسة الإلغاء</h2>
            <p>يمكنك إلغاء الاشتراك في أي وقت من خلال إعدادات حساب Google.</p>
        `,
        appstore: `
            <h1>شروط App Store</h1>
            <p class="highlight">SalesHub Pro — أبريل 2026</p>
            <h2>إرشادات App Review</h2>
            <p>يلتزم SalesHub Pro بجميع إرشادات مراجعة تطبيقات Apple.</p>
            <h2>الخصوصية</h2>
            <ul>
                <li>نجمع الحد الأدنى من البيانات الضرورية</li>
                <li>لا نبيع بيانات المستخدمين لأطراف ثالثة</li>
                <li>نوفر شفافية كاملة حول استخدام البيانات</li>
            </ul>
            <h2>الاشتراكات</h2>
            <ul>
                <li>تتجدد الاشتراكات تلقائياً</li>
                <li>يمكن الإلغاء من إعدادات Apple ID</li>
                <li>لا يتم استرداد المبالغ للفترات غير المستخدمة</li>
            </ul>
            <h2>Sign in with Apple</h2>
            <p>ندعم تسجيل الدخول عبر Apple لحماية خصوصيتك.</p>
        `
    };
    document.getElementById(page + 'Content').innerHTML = pages[page] || '<p>الصفحة غير متوفرة</p>';
}

function handleContactForm() {
    showToast('تم إرسال رسالتك بنجاح! سنرد عليك قريباً.', 'success');
}

// ===== Add Agent Modal =====
function showAddAgentModal() {
    const data = DB.getAll();
    const agents = data.users.filter(u => u.role === 'agent' && u.adminId === APP.currentUser.id);
    const plan = APP.currentUser.plan || 'free';
    const limit = getPlanLimits(plan);
    if (limit !== -1 && agents.length >= limit) {
        showToast(t('maxAgentsReached'), 'warning');
        return;
    }
    openModal(t('addAgent'), `
        <div class="form-group"><label>${t('name')}</label><input type="text" id="newAgentName" class="form-control" placeholder="اسم المندوب" required></div>
        <div class="form-group"><label>${t('email')}</label><input type="email" id="newAgentEmail" class="form-control" placeholder="example@email.com" required></div>
        <div class="form-group"><label>${t('phone')}</label><input type="tel" id="newAgentPhone" class="form-control" placeholder="رقم الموبايل" required></div>
        <div class="form-group"><label>كلمة المرور</label><input type="password" id="newAgentPass" class="form-control" placeholder="••••••••" required></div>
    `, `<button class="btn btn-primary" onclick="addNewAgent()"><i class="fas fa-plus"></i> ${t('addAgent')}</button>
        <button class="btn btn-secondary" onclick="closeModal()">${t('cancel')}</button>`);
}

function addNewAgent() {
    const name = document.getElementById('newAgentName').value.trim();
    const email = document.getElementById('newAgentEmail').value.trim();
    const phone = document.getElementById('newAgentPhone').value.trim();
    const pass = document.getElementById('newAgentPass').value;

    if (!name || !email || !phone || !pass) { showToast('جميع الحقول مطلوبة', 'error'); return; }
    if (!validateEmail(email)) { showToast(t('emailInvalid'), 'error'); return; }

    const data = DB.getAll();
    if (data.users.find(u => u.email === email)) { showToast(t('emailExists'), 'error'); return; }

    const user = {
        id: generateId(), name, email, phone, password: pass,
        role: 'agent', agencyId: APP.currentUser.agencyId,
        adminId: APP.currentUser.id, plan: null,
        status: 'active', createdAt: new Date().toISOString()
    };

    data.users.push(user);
    DB.set('users', data.users);
    closeModal();
    showToast(t('agentAdded'), 'success');
    addNotification(APP.currentUser.id, 'success', 'مندوب جديد', `تم إضافة ${name} كمندوب`);
    renderDashboard();
}

// ===== Search Clients =====
function setupSearch() {
    document.getElementById('searchClients').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const data = DB.getAll();
        const adminId = APP.currentUser.id;
        const agents = data.users.filter(u => u.role === 'agent' && u.adminId === adminId);
        const allClients = data.clients.filter(c => {
            const a = agents.find(x => x.id === c.agentId);
            return a && (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
        });
        renderAllClients(allClients, agents);
    });
}

// ===== Back to Top =====
function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('hidden', window.scrollY < 300);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== Mobile Nav =====
function setupMobileNav() {
    document.getElementById('navToggle').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('open');
    });
}

// ===== Init =====
function init() {
    // Load saved preferences
    const savedTheme = localStorage.getItem('shp_theme');
    if (savedTheme) {
        APP.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    const savedLang = localStorage.getItem('shp_lang');
    if (savedLang) {
        APP.lang = savedLang;
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    }

    // Setup events
    setupAuth();
    setupClientForm();
    setupBackToTop();
    setupMobileNav();
    setupSearch();

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('langToggle').addEventListener('click', toggleLang);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('addAgentBtn').addEventListener('click', showAddAgentModal);
    document.getElementById('notifBtn').addEventListener('click', () => {
        document.getElementById('notifPanel').classList.toggle('hidden');
    });
    document.getElementById('clearNotifs').addEventListener('click', clearNotifications);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // Hide nav elements initially
    document.getElementById('mainNav').classList.add('hidden');
    document.getElementById('mainFooter').classList.add('hidden');
    document.getElementById('notifBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');

    // Check existing session
    const savedUser = DB.get('currentUser');
    if (savedUser) {
        APP.currentUser = savedUser;
        postLogin();
    }

    // Splash screen
    setTimeout(() => {
        document.getElementById('splash').classList.add('fade-out');
        document.getElementById('app').classList.remove('hidden');
        setTimeout(() => document.getElementById('splash').remove(), 500);
    }, 1800);

    updateUI();
}

// Start
document.addEventListener('DOMContentLoaded', init);
