// ===== SalesHub Pro v2.0 =====
// ================================

// State
const S = {
    lang: localStorage.getItem('shp_lang') || 'ar',
    theme: localStorage.getItem('shp_theme') || 'light',
    user: null,
    charts: {}
};

// DB helpers
const DB = {
    get(k) { try { return JSON.parse(localStorage.getItem('shp_' + k)) || null; } catch { return null; } },
    set(k, v) { localStorage.setItem('shp_' + k, JSON.stringify(v)); },
    del(k) { localStorage.removeItem('shp_' + k); },
    all() {
        return {
            users: this.get('users') || [],
            clients: this.get('clients') || [],
            notifs: this.get('notifs') || [],
            settings: this.get('settings') || { baseSalary:3000, freeClientComm:10, pkg10Comm:50, pkg25Comm:80, pkg60Comm:120, pkgUnlimitedComm:200 }
        };
    }
};

// ==================== LANGUAGE ====================
function applyLang() {
    document.documentElement.lang = S.lang;
    document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-ar]').forEach(el => {
        const txt = S.lang === 'ar' ? el.dataset.ar : el.dataset.en;
        if (txt) el.textContent = txt;
    });
    document.querySelectorAll('[data-placeholder-ar]').forEach(el => {
        el.placeholder = S.lang === 'ar' ? el.dataset.placeholderAr : el.dataset.placeholderEn;
    });
}
function toggleLang() {
    S.lang = S.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('shp_lang', S.lang);
    applyLang();
    if (S.user) renderDashboard();
}

// ==================== THEME ====================
function applyTheme() {
    document.documentElement.setAttribute('data-theme', S.theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = S.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
function toggleTheme() {
    S.theme = S.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('shp_theme', S.theme);
    applyTheme();
    if (S.user) renderDashboard(); // redraw charts with correct colors
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const el = document.getElementById('page-' + page);
    if (el) { el.classList.remove('hidden'); }
    const legal = ['privacy','terms','refund','about','contact','adsense','googleplay','appstore'];
    // Render legal pages
    if (legal.includes(page)) renderLegal(page);
    // Back button for sub-pages (legal pages + dashboard pages)
    const backEl = document.getElementById('pageBackBtn');
    if (backEl) backEl.remove();
    const backTarget = S.user ? (S.user.role==='admin'?'admin':'agent') : 'auth';
    if (legal.includes(page) || page==='admin' || page==='agent') {
        const btn = document.createElement('button');
        btn.id = 'pageBackBtn';
        btn.className = 'btn btn-secondary page-back-btn';
        btn.innerHTML = `<i class="fas fa-arrow-${S.lang==='ar'?'right':'left'}"></i> <span data-ar="رجوع" data-en="Back">رجوع</span>`;
        btn.onclick = () => {
            if (backTarget==='auth') { navigateTo('auth'); toggleAuthMode('login'); }
            else navigateTo(backTarget);
        };
        el.prepend(btn);
    }
    // Close mobile menu
    document.getElementById('navLinks').classList.remove('open');
    applyLang();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== TOAST ====================
function showToast(msg, type = 'info', ms = 4000) {
    const c = document.getElementById('toastContainer');
    const icons = { success:'check-circle', error:'times-circle', warning:'exclamation-triangle', info:'info-circle' };
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<i class="fas fa-${icons[type]}"></i><span class="toast-text">${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-100%)'; setTimeout(()=>t.remove(),300); }, ms);
}

// ==================== MODAL ====================
function openModal(title, body, footer) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer || '';
    document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }

// ==================== UTIL ====================
function gid() { return 'id_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
function genAgencyId() { return 'AG-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase(); }
function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validPhone(phone, cc) {
    const len = phone.replace(/\D/g,'').length;
    const opt = document.querySelector(`option[value="${cc}"]`);
    return opt ? len === parseInt(opt.dataset.len) : len >= 7;
}
function fmtDate(d) {
    return new Date(d).toLocaleDateString(S.lang==='ar'?'ar-EG':'en-US', {year:'numeric',month:'short',day:'numeric'});
}
function getPeriod() {
    const n = new Date();
    let sm = n.getMonth()-1, sy = n.getFullYear();
    if (sm<0) { sm=11; sy--; }
    return { start: new Date(sy,sm,26), end: new Date(n.getFullYear(),n.getMonth(),25), label: `26/${sm+1}/${sy} → 25/${n.getMonth()+1}/${n.getFullYear()}` };
}
function getPeriodClients(clients, agentId) {
    const p = getPeriod();
    return clients.filter(c => { const d=new Date(c.date); return (!agentId||c.agentId===agentId) && d>=p.start && d<=p.end; });
}
function planLimit(p) { return {free:3,basic:10,pro:25,business:60,enterprise:-1}[p]||3; }
function calcComm(clients, s) {
    let t=0;
    clients.forEach(c => {
        const map = {free:s.freeClientComm,'10':s.pkg10Comm,'25':s.pkg25Comm,'60':s.pkg60Comm,unlimited:s.pkgUnlimitedComm};
        t += (map[c.package]||0);
    });
    return t;
}
function findDupes(clients) {
    const d=[], em={}, ph={};
    clients.forEach(c => {
        if (em[c.email]) d.push({type:'email',val:c.email,clients:[em[c.email],c]});
        else em[c.email]=c;
        if (ph[c.phone]) d.push({type:'phone',val:c.phone,clients:[ph[c.phone],c]});
        else ph[c.phone]=c;
    });
    return d;
}

// ==================== NOTIFICATIONS ====================
function addNotif(uid, type, title, msg) {
    const d = DB.all();
    d.notifs.push({id:gid(),uid,type,title,msg,read:false,date:new Date().toISOString()});
    DB.set('notifs', d.notifs);
    loadNotifs();
}
function loadNotifs() {
    if (!S.user) return;
    const d = DB.all();
    const notifs = d.notifs.filter(n => n.uid===S.user.id && !n.read);
    const badge = document.getElementById('notifBadge');
    badge.textContent = notifs.length;
    badge.classList.toggle('hidden', notifs.length===0);
    const list = document.getElementById('notifList');
    list.innerHTML = notifs.length ? notifs.map(n => {
        const icon = n.type==='warning'?'exclamation-triangle':n.type==='success'?'check-circle':'info-circle';
        return `<div class="notif-item" onclick="markNotif('${n.id}')"><div class="notif-icon ${n.type}"><i class="fas fa-${icon}"></i></div><div class="notif-text"><h4>${n.title}</h4><p>${n.msg}</p><div class="notif-time">${fmtDate(n.date)}</div></div></div>`;
    }).join('') : `<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>${S.lang==='ar'?'لا توجد إشعارات':'No notifications'}</p></div>`;
}
function markNotif(id) {
    const d = DB.all();
    const n = d.notifs.find(x=>x.id===id);
    if(n){n.read=true;DB.set('notifs',d.notifs);loadNotifs();}
}
function clearNotifs() {
    const d=DB.all();
    d.notifs=d.notifs.filter(n=>n.uid!==S.user.id);
    DB.set('notifs',d.notifs);
    loadNotifs();
}
function toggleNotifs() { document.getElementById('notifPanel').classList.toggle('hidden'); }

// ==================== AUTH ====================
function toggleAuthMode(mode) {
    document.getElementById('loginFields').classList.toggle('hidden', mode!=='login');
    document.getElementById('registerFields').classList.toggle('hidden', mode!=='register');
    document.getElementById('forgotFields').classList.toggle('hidden', mode!=='forgot');
    document.getElementById('forgotPassLink').classList.toggle('hidden', mode==='forgot');
    const t = document.getElementById('authTitle');
    const s = document.getElementById('authSubtitle');
    const b = document.getElementById('authBtnText');
    const l = document.getElementById('noAccountLink');
    if (mode==='login') {
        t.dataset.ar='تسجيل الدخول'; t.dataset.en='Login';
        s.dataset.ar='مرحباً بك في SalesHub Pro'; s.dataset.en='Welcome to SalesHub Pro';
        b.dataset.ar='تسجيل الدخول'; b.dataset.en='Login';
        l.dataset.ar='ليس لديك حساب؟ سجل الآن'; l.dataset.en="Don't have an account? Sign up";
        l.onclick = () => toggleAuthMode('register');
    } else if (mode==='register') {
        t.dataset.ar='تسجيل حساب جديد'; t.dataset.en='Create Account';
        s.dataset.ar='أنشئ حسابك'; s.dataset.en='Create your account';
        b.dataset.ar='تسجيل'; b.dataset.en='Register';
        l.dataset.ar='لديك حساب؟ سجل دخول'; l.dataset.en='Have an account? Login';
        l.onclick = () => toggleAuthMode('login');
    } else {
        t.dataset.ar='نسيت كلمة المرور'; t.dataset.en='Forgot Password';
        s.dataset.ar='سنرسل لك رابط الاستعادة'; s.dataset.en='We will send a reset link';
        b.dataset.ar='إرسال'; b.dataset.en='Send';
        l.dataset.ar='العودة لتسجيل الدخول'; l.dataset.en='Back to Login';
        l.onclick = () => toggleAuthMode('login');
    }
    applyLang(); // apply translation immediately
}

function handleAuth(e) {
    e.preventDefault();
    const loginFields = document.getElementById('loginFields');
    const registerFields = document.getElementById('registerFields');
    const forgotFields = document.getElementById('forgotFields');

    if (!loginFields.classList.contains('hidden')) return doLogin();
    if (!registerFields.classList.contains('hidden')) return doRegister();
    if (!forgotFields.classList.contains('hidden')) return doForgot();
}

function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    const d = DB.all();
    const u = d.users.find(u=>u.email===email && u.password===pass);
    if (!u) { showToast(S.lang==='ar'?'البريد أو كلمة المرور غير صحيحة':'Invalid email or password','error'); return; }
    S.user = u; DB.set('currentUser', u);
    showToast(S.lang==='ar'?'تم تسجيل الدخول بنجاح':'Login successful','success');
    postLogin();
}

function doRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const cc = document.getElementById('regCountryCode').value;
    const pass = document.getElementById('regPass').value;
    const confirm = document.getElementById('regPassConfirm').value;
    const role = document.querySelector('input[name="regRole"]:checked').value;
    const agencyId = document.getElementById('agencyIdInput').value.trim();

    if (!validEmail(email)) { showToast(S.lang==='ar'?'البريد الإلكتروني غير صالح':'Invalid email','error'); return; }
    if (!validPhone(phone,cc)) { showToast(S.lang==='ar'?'رقم الموبايل غير صحيح':'Invalid phone number','error'); return; }
    if (pass.length<6) { showToast(S.lang==='ar'?'كلمة المرور قصيرة جداً':'Password too short','error'); return; }
    if (pass!==confirm) { showToast(S.lang==='ar'?'كلمتا المرور غير متطابقتين':'Passwords do not match','error'); return; }

    const d = DB.all();
    if (d.users.find(u=>u.email===email)) { showToast(S.lang==='ar'?'البريد مسجل بالفعل':'Email already registered','error'); return; }

    let userAgencyId=null, linkedAdmin=null;
    if (role==='agent') {
        if (!agencyId) { showToast(S.lang==='ar'?'رقم الوكالة مطلوب':'Agency ID required','error'); return; }
        const admin = d.users.find(u=>u.role==='admin' && u.agencyId===agencyId);
        if (!admin) { showToast(S.lang==='ar'?'رقم الوكالة غير صحيح':'Invalid Agency ID','error'); return; }
        const count = d.users.filter(u=>u.role==='agent' && u.adminId===admin.id).length;
        if (planLimit(admin.plan||'free')!==-1 && count>=planLimit(admin.plan||'free')) {
            showToast(S.lang==='ar'?'تم الوصول للحد الأقصى من المناديب':'Max agents reached','warning'); return;
        }
        linkedAdmin = admin.id;
        userAgencyId = agencyId;
    } else {
        userAgencyId = genAgencyId();
    }

    const user = { id:gid(), name, email, phone:'+'+cc+phone, password:pass, role, agencyId:userAgencyId, adminId:linkedAdmin, plan:role==='admin'?'free':null, status:'active', createdAt:new Date().toISOString() };
    d.users.push(user); DB.set('users', d.users);
    if (role==='agent' && linkedAdmin) addNotif(linkedAdmin,'info','مندوب جديد','انضم '+name+' كمندوب');
    S.user = user; DB.set('currentUser', user);
    showToast(S.lang==='ar'?'تم التسجيل بنجاح':'Registration successful','success');
    postLogin();
}

function doForgot() {
    const email = document.getElementById('forgotEmail').value.trim();
    if (!validEmail(email)) { showToast(S.lang==='ar'?'البريد غير صالح':'Invalid email','error'); return; }
    showToast(S.lang==='ar'?'تم إرسال رابط إعادة تعيين كلمة المرور':'Password reset link sent','success');
    toggleAuthMode('login');
}

function postLogin() {
    navigateTo('dashboard');
    document.getElementById('notifBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    // Update nav
    const nav = document.getElementById('navLinks');
    if (S.user.role==='admin') {
        nav.innerHTML = `<a href="#" data-page="dashboard" onclick="navigateTo('admin');return false" class="active" data-ar="لوحة التحكم" data-en="Dashboard">لوحة التحكم</a>`;
    } else {
        nav.innerHTML = `<a href="#" data-page="dashboard" onclick="navigateTo('agent');return false" class="active" data-ar="لوحة التحكم" data-en="Dashboard">لوحة التحكم</a>`;
    }
    applyLang();
    renderDashboard();
    loadNotifs();
}

function handleLogout() {
    S.user = null; DB.del('currentUser');
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    document.getElementById('page-auth').classList.remove('hidden');
    document.getElementById('notifBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('notifBadge').classList.add('hidden');
    document.getElementById('navLinks').innerHTML = '';
    toggleAuthMode('login');
    showToast(S.lang==='ar'?'تم تسجيل الخروج':'Logged out','info');
}

// ==================== DASHBOARD ====================
function renderDashboard() {
    if (!S.user) return;
    if (S.user.role==='admin') renderAdmin();
    else renderAgent();
    applyLang(); // re-apply translation to dynamic content
}

// ==================== ADMIN ====================
function renderAdmin() {
    navigateTo('admin');
    const d = DB.all();
    const uid = S.user.id;
    const agents = d.users.filter(u=>u.role==='agent'&&u.adminId===uid);
    const allClients = d.clients.filter(c=>{const a=agents.find(x=>x.id===c.agentId);return !!a;});
    const periodClients = getPeriodClients(allClients);

    // Settings
    document.getElementById('baseSalary').value = d.settings.baseSalary;
    document.getElementById('freeClientComm').value = d.settings.freeClientComm;
    document.getElementById('pkg10Comm').value = d.settings.pkg10Comm;
    document.getElementById('pkg25Comm').value = d.settings.pkg25Comm;
    document.getElementById('pkg60Comm').value = d.settings.pkg60Comm;
    document.getElementById('pkgUnlimitedComm').value = d.settings.pkgUnlimitedComm;

    // Stats
    const totalComm = agents.reduce((s,a)=> s+calcComm(getPeriodClients(allClients,a.id),d.settings), 0);
    const isAr = S.lang==='ar';
    document.getElementById('adminStats').innerHTML = `
        <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-users"></i></div><div class="stat-info"><h3>${agents.length}</h3><p>${isAr?'إجمالي المناديب':'Total Agents'}</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-address-book"></i></div><div class="stat-info"><h3>${allClients.length}</h3><p>${isAr?'إجمالي العملاء':'Total Clients'}</p></div></div>
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-user-check"></i></div><div class="stat-info"><h3>${periodClients.length}</h3><p>${isAr?'عملاء هذه الفترة':'Period Clients'}</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-money-bill-wave"></i></div><div class="stat-info"><h3>${totalComm.toLocaleString()} ${isAr?'ج':'EGP'}</h3><p>${isAr?'إجمالي العمولات':'Total Commissions'}</p></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><h3>${findDupes(allClients).length}</h3><p>${isAr?'تحذيرات':'Warnings'}</p></div></div>
    `;

    // Agents Table
    const pkgNames = {free:isAr?'مجاني':'Free','10':isAr?'باقة 10':'Plan 10','25':isAr?'باقة 25':'Plan 25','60':isAr?'باقة 60':'Plan 60',unlimited:isAr?'غير محدود':'Unlimited'};
    document.getElementById('agentsTableBody').innerHTML = agents.length ? agents.map((a,i) => {
        const ac = allClients.filter(c=>c.agentId===a.id);
        const pc = getPeriodClients(allClients,a.id);
        const comm = calcComm(pc,d.settings);
        return `<tr>
            <td>${i+1}</td><td>${a.name}</td><td>${a.email}</td><td>${a.phone}</td>
            <td>${ac.length}</td><td>${comm.toLocaleString()} ${isAr?'ج':'EGP'}</td><td>${d.settings.baseSalary.toLocaleString()} ${isAr?'ج':'EGP'}</td>
            <td><span class="badge ${a.status==='active'?'badge-success':'badge-danger'}">${a.status==='active'?(isAr?'نشط':'Active'):(isAr?'غير نشط':'Inactive')}</span></td>
            <td class="actions">
                <button class="btn-icon" onclick="editAgent('${a.id}')" title="${isAr?'تعديل':'Edit'}"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="toggleAgent('${a.id}')" title="${isAr?'حالة':'Toggle'}"><i class="fas fa-toggle-${a.status==='active'?'on':'off'}"></i></button>
                <button class="btn-icon" onclick="deleteAgent('${a.id}')" title="${isAr?'حذف':'Delete'}" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
            </td></tr>`;
    }).join('') : `<tr><td colspan="9" style="text-align:center">${isAr?'لا توجد بيانات':'No data'}</td></tr>`;

    // All Clients
    renderClients(allClients, agents, pkgNames);

    // Warnings
    const dupes = findDupes(allClients);
    const warnCard = document.getElementById('warningsCard');
    if (dupes.length===0) { warnCard.classList.add('hidden'); }
    else {
        warnCard.classList.remove('hidden');
        document.getElementById('warningsList').innerHTML = dupes.map(w => {
            const names = w.clients.map(c=>{const a=agents.find(x=>x.id===c.agentId);return a?a.name:'?';});
            return `<div class="warning-item"><i class="fas fa-exclamation-triangle"></i><div class="warn-info"><h4>${w.type==='email'?(isAr?'بريد مكرر':'Duplicate Email'):(isAr?'موبايل مكرر':'Duplicate Phone')}</h4><p>${w.val} — ${isAr?'المناديب':'Agents'}: ${names.join(', ')}</p></div></div>`;
        }).join('');
        // Send admin notifications for duplicates
        dupes.forEach(w => {
            w.clients.forEach(c => {
                const a = agents.find(x=>x.id===c.agentId);
                if (a) addNotif(uid,'warning', w.type==='email'?(isAr?'بريد مكرر':'Dup Email'):(isAr?'موبايل مكرر':'Dup Phone'), `${a.name} — ${w.val}`);
            });
        });
    }

    // Salary Report
    document.getElementById('reportPeriod').textContent = getPeriod().label;
    document.getElementById('salaryBody').innerHTML = agents.length ? agents.map(a => {
        const pc = getPeriodClients(allClients,a.id);
        const cnt = {free:0,'10':0,'25':0,'60':0,unlimited:0};
        pc.forEach(c=>{if(cnt[c.package]!==undefined)cnt[c.package]++;});
        const comm = calcComm(pc,d.settings);
        const net = d.settings.baseSalary + comm;
        return `<tr><td>${a.name}</td><td>${cnt.free}</td><td>${cnt['10']}</td><td>${cnt['25']}</td><td>${cnt['60']}</td><td>${cnt.unlimited}</td>
            <td>${comm.toLocaleString()} ${isAr?'ج':'EGP'}</td><td>${d.settings.baseSalary.toLocaleString()} ${isAr?'ج':'EGP'}</td><td><strong>${net.toLocaleString()} ${isAr?'ج':'EGP'}</strong></td></tr>`;
    }).join('') : `<tr><td colspan="9" style="text-align:center">${isAr?'لا توجد بيانات':'No data'}</td></tr>`;

    // Charts
    renderCharts(agents, allClients);
}

function renderClients(clients, agents, pkgNames) {
    const isAr = S.lang==='ar';
    if (!pkgNames) pkgNames = {free:isAr?'مجاني':'Free','10':isAr?'باقة 10':'Plan 10','25':isAr?'باقة 25':'Plan 25','60':isAr?'باقة 60':'Plan 60',unlimited:isAr?'غير محدود':'Unlimited'};
    document.getElementById('allClientsBody').innerHTML = clients.length ? clients.map((c,i) => {
        const a = agents.find(x=>x.id===c.agentId);
        return `<tr><td>${i+1}</td><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.address}</td>
            <td><span class="badge badge-primary">${pkgNames[c.package]||c.package}</span></td><td>${a?a.name:'-'}</td><td>${fmtDate(c.date)}</td></tr>`;
    }).join('') : `<tr><td colspan="8" style="text-align:center">${isAr?'لا توجد بيانات':'No data'}</td></tr>`;
}

function searchClients(q) {
    q = q.toLowerCase();
    const d = DB.all();
    const agents = d.users.filter(u=>u.role==='agent'&&u.adminId===S.user.id);
    const filtered = d.clients.filter(c => {
        const a = agents.find(x=>x.id===c.agentId);
        return a && (c.name.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||c.phone.includes(q));
    });
    renderClients(filtered, agents);
}

// Charts
function renderCharts(agents, clients) {
    const colors = ['#6C63FF','#2ED573','#FFA502','#FF6B6B','#1E90FF'];
    const txtColor = S.theme==='dark'?'#E8E8E8':'#2C3E50';
    const gridColor = S.theme==='dark'?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)';

    if (S.charts.agents) S.charts.agents.destroy();
    const ac = document.getElementById('agentsChart');
    if (ac) {
        S.charts.agents = new Chart(ac, {
            type:'bar', data:{ labels: agents.map(a=>a.name), datasets:[{label:S.lang==='ar'?'العملاء':'Clients', data: agents.map(a=>clients.filter(c=>c.agentId===a.id).length), backgroundColor:colors, borderRadius:8}] },
            options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{ticks:{color:txtColor},grid:{color:gridColor}},x:{ticks:{color:txtColor}}} }
        });
    }

    if (S.charts.packages) S.charts.packages.destroy();
    const pc = document.getElementById('packagesChart');
    if (pc) {
        const cnt = {free:0,'10':0,'25':0,'60':0,unlimited:0};
        clients.forEach(c=>{if(cnt[c.package]!==undefined)cnt[c.package]++;});
        S.charts.packages = new Chart(pc, {
            type:'doughnut',
            data:{ labels:[S.lang==='ar'?'مجاني':'Free','10','25','60',S.lang==='ar'?'غير محدود':'Unlimited'], datasets:[{data:Object.values(cnt),backgroundColor:colors,borderWidth:0}] },
            options:{ responsive:true, plugins:{legend:{position:'bottom',labels:{color:txtColor,padding:16,font:{family:'Cairo'}}}} }
        });
    }
}

// ==================== AGENT CRUD ====================
function editAgent(id) {
    const d=DB.all(); const a=d.users.find(u=>u.id===id); if(!a)return;
    const isAr=S.lang==='ar';
    openModal(isAr?'تعديل مندوب':'Edit Agent', `
        <div class="form-group"><label>${isAr?'الاسم':'Name'}</label><input type="text" id="editAName" class="form-control" value="${a.name}"></div>
        <div class="form-group"><label>${isAr?'البريد':'Email'}</label><input type="email" id="editAEmail" class="form-control" value="${a.email}"></div>
        <div class="form-group"><label>${isAr?'الموبايل':'Phone'}</label><input type="tel" id="editAPhone" class="form-control" value="${a.phone}"></div>`,
        `<button class="btn btn-primary" onclick="saveAgent('${id}')"><i class="fas fa-save"></i> ${isAr?'حفظ':'Save'}</button>
         <button class="btn btn-secondary" onclick="closeModal()">${isAr?'إلغاء':'Cancel'}</button>`);
}
function saveAgent(id) {
    const d=DB.all(); const i=d.users.findIndex(u=>u.id===id); if(i<0)return;
    d.users[i].name=document.getElementById('editAName').value;
    d.users[i].email=document.getElementById('editAEmail').value;
    d.users[i].phone=document.getElementById('editAPhone').value;
    DB.set('users',d.users); closeModal(); showToast(S.lang==='ar'?'تم التحديث':'Updated','success'); renderDashboard();
}
function toggleAgent(id) {
    const d=DB.all(); const a=d.users.find(u=>u.id===id); if(!a)return;
    a.status=a.status==='active'?'inactive':'active'; DB.set('users',d.users);
    showToast(S.lang==='ar'?'تم تغيير الحالة':'Status changed','success'); renderDashboard();
}
function deleteAgent(id) {
    const isAr=S.lang==='ar';
    openModal(isAr?'تأكيد الحذف':'Confirm Delete', `<p>${isAr?'سيتم حذف المندوب وجميع بياناته':'Agent and all data will be deleted'}</p>`,
        `<button class="btn btn-danger" onclick="confirmDeleteAgent('${id}')"><i class="fas fa-trash"></i> ${isAr?'حذف':'Delete'}</button>
         <button class="btn btn-secondary" onclick="closeModal()">${isAr?'إلغاء':'Cancel'}</button>`);
}
function confirmDeleteAgent(id) {
    const d=DB.all();
    d.users=d.users.filter(u=>u.id!==id); d.clients=d.clients.filter(c=>c.agentId!==id);
    DB.set('users',d.users); DB.set('clients',d.clients); closeModal();
    showToast(S.lang==='ar'?'تم الحذف':'Deleted','success'); renderDashboard();
}
function showAddAgentModal() {
    const d=DB.all(); const agents=d.users.filter(u=>u.role==='agent'&&u.adminId===S.user.id);
    const limit=planLimit(S.user.plan||'free');
    if(limit!==-1&&agents.length>=limit){showToast(S.lang==='ar'?'تم الوصول للحد الأقصى':'Max agents reached','warning');return;}
    const isAr=S.lang==='ar';
    openModal(isAr?'إضافة مندوب':'Add Agent', `
        <div class="form-group"><label>${isAr?'الاسم':'Name'}</label><input type="text" id="newAName" class="form-control" placeholder="${isAr?'اسم المندوب':'Agent name'}"></div>
        <div class="form-group"><label>${isAr?'البريد':'Email'}</label><input type="email" id="newAEmail" class="form-control" placeholder="email@example.com"></div>
        <div class="form-group"><label>${isAr?'الموبايل':'Phone'}</label><input type="tel" id="newAPhone" class="form-control" placeholder="${isAr?'رقم الموبايل':'Phone'}"></div>
        <div class="form-group"><label>${isAr?'كلمة المرور':'Password'}</label><input type="password" id="newAPass" class="form-control" placeholder="••••••••"></div>`,
        `<button class="btn btn-primary" onclick="addNewAgent()"><i class="fas fa-plus"></i> ${isAr?'إضافة':'Add'}</button>
         <button class="btn btn-secondary" onclick="closeModal()">${isAr?'إلغاء':'Cancel'}</button>`);
}
function addNewAgent() {
    const name=document.getElementById('newAName').value.trim();
    const email=document.getElementById('newAEmail').value.trim();
    const phone=document.getElementById('newAPhone').value.trim();
    const pass=document.getElementById('newAPass').value;
    const isAr=S.lang==='ar';
    if(!name||!email||!pass){showToast(isAr?'جميع الحقول مطلوبة':'All fields required','error');return;}
    if(!validEmail(email)){showToast(isAr?'البريد غير صالح':'Invalid email','error');return;}
    const d=DB.all();
    if(d.users.find(u=>u.email===email)){showToast(isAr?'البريد مسجل بالفعل':'Email exists','error');return;}
    const user={id:gid(),name,email,phone,password:pass,role:'agent',agencyId:S.user.agencyId,adminId:S.user.id,plan:null,status:'active',createdAt:new Date().toISOString()};
    d.users.push(user); DB.set('users',d.users); closeModal();
    showToast(isAr?'تم إضافة المندوب':'Agent added','success');
    addNotif(S.user.id,'success',isAr?'مندوب جديد':'New Agent',name);
    renderDashboard();
}

function saveSettings() {
    const d=DB.all();
    d.settings={
        baseSalary:parseInt(document.getElementById('baseSalary').value)||0,
        freeClientComm:parseInt(document.getElementById('freeClientComm').value)||0,
        pkg10Comm:parseInt(document.getElementById('pkg10Comm').value)||0,
        pkg25Comm:parseInt(document.getElementById('pkg25Comm').value)||0,
        pkg60Comm:parseInt(document.getElementById('pkg60Comm').value)||0,
        pkgUnlimitedComm:parseInt(document.getElementById('pkgUnlimitedComm').value)||0
    };
    DB.set('settings',d.settings);
    showToast(S.lang==='ar'?'تم حفظ الإعدادات':'Settings saved','success');
    renderDashboard();
}

// ==================== AGENT DASHBOARD ====================
function renderAgent() {
    navigateTo('agent');
    const d=DB.all();
    const a=S.user;
    const clients=d.clients.filter(c=>c.agentId===a.id);
    const pc=getPeriodClients(clients);
    const comm=calcComm(pc,d.settings);
    const net=d.settings.baseSalary+comm;
    const isAr=S.lang==='ar';

    document.getElementById('agentAgencyBadge').textContent = (isAr?'رقم الوكالة':'Agency ID')+': '+a.agencyId;

    document.getElementById('agentStats').innerHTML = `
        <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-users"></i></div><div class="stat-info"><h3>${clients.length}</h3><p>${isAr?'إجمالي عملائي':'Total Clients'}</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-user-check"></i></div><div class="stat-info"><h3>${pc.length}</h3><p>${isAr?'عملاء هذه الفترة':'Period Clients'}</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-coins"></i></div><div class="stat-info"><h3>${comm.toLocaleString()} ${isAr?'ج':'EGP'}</h3><p>${isAr?'عمولتي':'Commission'}</p></div></div>
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-wallet"></i></div><div class="stat-info"><h3>${net.toLocaleString()} ${isAr?'ج':'EGP'}</h3><p>${isAr?'صافي الراتب':'Net Salary'}</p></div></div>`;

    const pkgNames={free:isAr?'مجاني':'Free','10':isAr?'باقة 10':'Plan 10','25':isAr?'باقة 25':'Plan 25','60':isAr?'باقة 60':'Plan 60',unlimited:isAr?'غير محدود':'Unlimited'};
    document.getElementById('myClientsBody').innerHTML = clients.length ? clients.map((c,i)=>`
        <tr><td>${i+1}</td><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.address}</td>
        <td><span class="badge badge-primary">${pkgNames[c.package]||c.package}</span></td><td>${fmtDate(c.date)}</td></tr>`).join('')
        : `<tr><td colspan="7" style="text-align:center">${isAr?'لا توجد بيانات':'No data'}</td></tr>`;

    // Salary
    document.getElementById('agentReportPeriod').textContent = getPeriod().label;
    const cnt={free:0,'10':0,'25':0,'60':0,unlimited:0};
    pc.forEach(c=>{if(cnt[c.package]!==undefined)cnt[c.package]++;});
    document.getElementById('mySalarySummary').innerHTML = `
        <div class="salary-card"><h4>${isAr?'عملاء مجاني':'Free'}</h4><div class="amount">${cnt.free}</div></div>
        <div class="salary-card"><h4>10</h4><div class="amount">${cnt['10']}</div></div>
        <div class="salary-card"><h4>25</h4><div class="amount">${cnt['25']}</div></div>
        <div class="salary-card"><h4>60</h4><div class="amount">${cnt['60']}</div></div>
        <div class="salary-card"><h4>${isAr?'غير محدود':'∞'}</h4><div class="amount">${cnt.unlimited}</div></div>
        <div class="salary-card"><h4>${isAr?'العمولة':'Commission'}</h4><div class="amount">${comm.toLocaleString()} ${isAr?'ج':'EGP'}</div></div>
        <div class="salary-card"><h4>${isAr?'الراتب الأساسي':'Base'}</h4><div class="amount">${d.settings.baseSalary.toLocaleString()} ${isAr?'ج':'EGP'}</div></div>
        <div class="salary-card total"><h4>${isAr?'صافي الراتب':'Net'}</h4><div class="amount">${net.toLocaleString()} ${isAr?'ج':'EGP'}</div></div>`;
}

// Add Client
function addClient(e) {
    e.preventDefault();
    const name=document.getElementById('clientName').value.trim();
    const email=document.getElementById('clientEmail').value.trim();
    const phone=document.getElementById('clientPhone').value.trim();
    const cc=document.getElementById('clientCountryCode').value;
    const address=document.getElementById('clientAddress').value.trim();
    const pkg=document.getElementById('clientPackage').value;
    const isAr=S.lang==='ar';

    if(!validEmail(email)){showToast(isAr?'البريد غير صالح':'Invalid email','error');return false;}
    if(!validPhone(phone,cc)){showToast(isAr?'رقم الموبايل غير صحيح':'Invalid phone','error');return false;}

    const d=DB.all();
    const fullPhone='+'+cc+phone;

    // Duplicate check → warn admin
    const dupEmail=d.clients.find(c=>c.email===email);
    const dupPhone=d.clients.find(c=>c.phone===fullPhone);
    if(dupEmail||dupPhone) {
        const admin=d.users.find(u=>u.id===S.user.adminId);
        if(admin) {
            if(dupEmail) addNotif(admin.id,'warning',isAr?'بريد مكرر':'Dup Email',`${S.user.name} — ${email}`);
            if(dupPhone) addNotif(admin.id,'warning',isAr?'موبايل مكرر':'Dup Phone',`${S.user.name} — ${fullPhone}`);
        }
    }

    d.clients.push({id:gid(),name,email,phone:fullPhone,address,package:pkg,agentId:S.user.id,date:new Date().toISOString()});
    DB.set('clients',d.clients);
    showToast(isAr?'تم إضافة العميل بنجاح':'Client added','success');
    e.target.reset();
    renderDashboard();
    return false;
}

// ==================== LEGAL PAGES ====================
function renderLegal(page) {
    const isAr = S.lang==='ar';
    const content = {
        privacy: {
            ar: `<h1>سياسة الخصوصية</h1><p class="highlight">آخر تحديث: أبريل 2026</p>
<h2>1. المعلومات التي نجمعها</h2><p>نجمع المعلومات التي تقدمها عند إنشاء حسابك: الاسم، البريد الإلكتروني، رقم الهاتف، ومعلومات العملاء.</p>
<h2>2. كيفية استخدام المعلومات</h2><ul><li>تقديم وتحسين خدمات إدارة المبيعات</li><li>حساب الرواتب والعمولات</li><li>إرسال إشعارات نظام</li><li>تحليل أداء المناديب</li></ul>
<h2>3. مشاركة المعلومات مع أطراف ثالثة</h2><ul><li><strong>Google AdSense:</strong> لعرض إعلانات مناسبة</li><li><strong>Cookies:</strong> لتحسين التجربة وتذكر التفضيلات</li><li><strong>Google Analytics:</strong> لفهم سلوك المستخدمين</li><li><strong>مزودي الخدمات:</strong> استضافة ودعم فني</li></ul>
<h2>4. خصوصية الأطفال</h2><div class="highlight"><p>تطبيقنا غير مخصص للأطفال دون 13 عاماً. لا نجمع بيانات شخصية من الأطفال. إذا علمنا بطفل قدّم بيانات، سنحذفها فوراً.</p></div>
<h2>5. ملفات تعريف الارتباط (Cookies)</h2><ul><li>تذكر تسجيل الدخول والتفضيلات</li><li>تحليل حركة المرور</li><li>تخصيص المحتوى والإعلانات</li></ul><p>يمكنك التحكم في Cookies من إعدادات المتصفح.</p>
<h2>6. أمان البيانات</h2><p>نتخذ إجراءات أمنية لحماية بياناتك من الوصول غير المصرح به.</p>
<h2>7. حقوقك</h2><ul><li>الوصول لبياناتك</li><li>تصحيح البيانات</li><li>طلب الحذف</li><li>الاعتراض على المعالجة</li></ul>
<h2>8. الاحتفاظ بالبيانات</h2><p>نحتفظ بالبيانات طالما الحساب نشط أو حسب الالتزامات القانونية.</p>
<h2>9. التغييرات</h2><p>قد نحدث هذه السياسة وسنخطرك بالتغييرات الجوهرية.</p>
<h2>10. اتصل بنا</h2><p>للاستفسارات: emadh5156@gmail.com</p>`,
            en: `<h1>Privacy Policy</h1><p class="highlight">Last updated: April 2026</p>
<h2>1. Information We Collect</h2><p>We collect information you provide when creating your account: name, email, phone, and client data.</p>
<h2>2. How We Use Information</h2><ul><li>Providing sales management services</li><li>Calculating salaries and commissions</li><li>Sending system notifications</li><li>Analyzing agent performance</li></ul>
<h2>3. Third-Party Sharing</h2><ul><li><strong>Google AdSense:</strong> To display relevant ads</li><li><strong>Cookies:</strong> To improve experience and remember preferences</li><li><strong>Google Analytics:</strong> To understand user behavior</li><li><strong>Service Providers:</strong> Hosting and support</li></ul>
<h2>4. Children's Privacy</h2><div class="highlight"><p>Our app is not intended for children under 13. We do not knowingly collect personal data from children. If we learn a child has provided data, we will delete it immediately.</p></div>
<h2>5. Cookies</h2><ul><li>Remember login and preferences</li><li>Analyze traffic</li><li>Personalize content and ads</li></ul><p>You can control cookies through browser settings.</p>
<h2>6. Data Security</h2><p>We take security measures to protect your data from unauthorized access.</p>
<h2>7. Your Rights</h2><ul><li>Access your data</li><li>Correct data</li><li>Request deletion</li><li>Object to processing</li></ul>
<h2>8. Data Retention</h2><p>We retain data while your account is active or as required by law.</p>
<h2>9. Changes</h2><p>We may update this policy and will notify you of material changes.</p>
<h2>10. Contact Us</h2><p>For inquiries: emadh5156@gmail.com</p>`
        },
        terms: {
            ar: `<h1>الشروط والأحكام</h1><p class="highlight">آخر تحديث: أبريل 2026</p>
<h2>شروط Google Play (15 شرط)</h2><ol>
<li>التوافق مع سياسات Google Play</li><li>عدم تضمين محتوى ضار أو مضلل</li><li>حماية بيانات المستخدم</li><li>عدم جمع بيانات غير ضرورية</li><li>وصف دقيق للتطبيق والميزات</li><li>عدم استخدام العلامات التجارية بشكل مضلل</li><li>الامتثال لقوانين حماية البيانات</li><li>عدم إرسال إشعارات غير مرغوبة</li><li>توفير طريقة واضحة للتواصل</li><li>عدم استخدام صلاحيات الجهاز بشكل مفرط</li><li>التوافق مع إصدارات Android</li><li>عدم تضمين برمجيات خبيثة</li><li>الالتزام بمعايير الجودة</li><li>تجربة مستخدم سلسة</li><li>التحديث الدوري للأمان</li></ol>
<h2>شروط App Store (15 شرط)</h2><ol>
<li>الامتثال لإرشادات Apple</li><li>عدم محتوى غير لائق</li><li>حماية الخصوصية</li><li>عدم جمع بيانات الموقع بلا إذن</li><li>تجربة مستخدم متسقة</li><li>عدم استخدام Private APIs</li><li>التوافق مع iOS</li><li>عدم انتهاك حقوق الملكية</li><li>توضيح نموذج الاشتراك</li><li>سهولة الإلغاء</li><li>عدم إشعارات ترويجية بلا إذن</li><li>استقرار الأداء</li><li>عدم آليات دفع خارجية</li><li>الامتثال لقوانين التصدير</li><li>محتوى مناسب لجميع الأعمار</li></ol>
<h2>الشروط العامة</h2>
<h3>1. القبول</h3><p>باستخدام SalesHub Pro، توافق على هذه الشروط.</p>
<h3>2. الاستخدام المسموح</h3><p>لأغراض تجارية مشروعة فقط.</p>
<h3>3. الحسابات</h3><p>أنت مسؤول عن سرية بيانات حسابك.</p>
<h3>4. الاشتراكات</h3><p>تُدفع شهرياً مقدماً. التجديد تلقائي ما لم يُلغَ.</p>
<h3>5. الملكية الفكرية</h3><p>جميع الحقوق مملوكة لـ SalesHub Pro.</p>
<h3>6. إخلاء المسؤولية</h3><p>الخدمة مقدمة "كما هي" بدون ضمانات.</p>
<h3>7. تحديد المسؤولية</h3><p>لسنا مسؤولين عن أضرار مباشرة أو غير مباشرة.</p>
<h3>8. التعديلات</h3><p>نحتفظ بالحق في تعديل الشروط مع إشعار.</p>
<h3>9. القانون الحاكم</h3><p>تخضع لقوانين جمهورية مصر العربية.</p>
<h3>10. حل النزاعات</h3><p>عبر المحاكم المختصة في القاهرة.</p>`,
            en: `<h1>Terms & Conditions</h1><p class="highlight">Last updated: April 2026</p>
<h2>Google Play Terms (15 conditions)</h2><ol>
<li>Comply with Google Play policies</li><li>No harmful or misleading content</li><li>Protect user data</li><li>Don't collect unnecessary data</li><li>Accurate app description</li><li>No misleading trademark use</li><li>Comply with data protection laws</li><li>No unwanted notifications</li><li>Clear contact method</li><li>Don't overuse device permissions</li><li>Compatible with Android versions</li><li>No malicious software</li><li>Meet quality standards</li><li>Smooth user experience</li><li>Regular security updates</li></ol>
<h2>App Store Terms (15 conditions)</h2><ol>
<li>Comply with Apple guidelines</li><li>No inappropriate content</li><li>Protect privacy</li><li>No location data without consent</li><li>Consistent UX</li><li>No Private APIs</li><li>iOS compatible</li><li>No IP infringement</li><li>Clear subscription model</li><li>Easy cancellation</li><li>No promotional notifications without consent</li><li>Stable performance</li><li>No external payment mechanisms</li><li>Export law compliance</li><li>All-ages appropriate</li></ol>
<h2>General Terms</h2>
<h3>1. Acceptance</h3><p>By using SalesHub Pro, you agree to these terms.</p>
<h3>2. Permitted Use</h3><p>For legitimate business purposes only.</p>
<h3>3. Accounts</h3><p>You are responsible for account credential security.</p>
<h3>4. Subscriptions</h3><p>Paid monthly in advance. Auto-renewal unless cancelled.</p>
<h3>5. Intellectual Property</h3><p>All rights belong to SalesHub Pro.</p>
<h3>6. Disclaimer</h3><p>Service provided "as is" without warranties.</p>
<h3>7. Liability Limitation</h3><p>We are not liable for direct or indirect damages.</p>
<h3>8. Modifications</h3><p>We reserve the right to modify terms with notice.</p>
<h3>9. Governing Law</h3><p>Subject to Egyptian Arab Republic laws.</p>
<h3>10. Dispute Resolution</h3><p>Through competent courts in Cairo.</p>`
        },
        refund: {
            ar: `<h1>سياسة الاسترجاع والاستبدال</h1><p class="highlight">SalesHub Pro — أبريل 2026</p>
<h2>1. الاسترجاع</h2><p>يمكنك طلب الاسترجاع خلال 14 يوماً من الدفع شريطة عدم الاستخدام المكثف.</p>
<h2>2. الشروط</h2><ul><li>الطلب خلال 14 يوماً</li><li>تقديم سبب واضح</li><li>عدم تجاوز حد المعاملات</li></ul>
<h2>3. الاستبدال</h2><ul><li>تمديد الاشتراك مجاناً</li><li>ترقية مؤقتة للباقة</li><li>حل تقني خلال 48 ساعة</li></ul>
<h2>4. كيفية الطلب</h2><p>أرسل إلى: emadh5156@gmail.com مع رقم الاشتراك والسبب.</p>
<h2>5. مدة المعالجة</h2><p>5-10 أيام عمل.</p>
<h2>6. حالات الرفض</h2><ul><li>تجاوز 14 يوماً</li><li>استخدام مكثف</li><li>انتهاك الشروط</li></ul>`,
            en: `<h1>Refund & Replacement Policy</h1><p class="highlight">SalesHub Pro — April 2026</p>
<h2>1. Refund</h2><p>You may request a refund within 14 days of payment, provided no intensive use.</p>
<h2>2. Conditions</h2><ul><li>Request within 14 days</li><li>Clear reason provided</li><li>Transaction limit not exceeded</li></ul>
<h2>3. Replacement</h2><ul><li>Free subscription extension</li><li>Temporary plan upgrade</li><li>Technical solution within 48 hours</li></ul>
<h2>4. How to Request</h2><p>Email: emadh5156@gmail.com with subscription ID and reason.</p>
<h2>5. Processing Time</h2><p>5-10 business days.</p>
<h2>6. Rejection Cases</h2><ul><li>Over 14 days</li><li>Intensive use</li><li>Terms violation</li></ul>`
        },
        about: {
            ar: `<h1>من نحن</h1>
<h2>رسالتنا</h2><div class="highlight"><p>تمكين الشركات من إدارة فرق المبيعات بكفاءة وشفافية عالية عبر منصة ذكية.</p></div>
<h2>رؤيتنا</h2><p>أن نكون المنصة الرائدة في إدارة المبيعات بالشرق الأوسط.</p>
<h2>إحصائياتنا</h2><ul><li><strong>+500</strong> شركة</li><li><strong>+5,000</strong> مندوب نشط</li><li><strong>+100,000</strong> عميل مسجل</li><li><strong>99.9%</strong> وقت تشغيل</li></ul>
<h2>قيمنا</h2><ul><li><strong>الشفافية:</strong> وضوح في كل شيء</li><li><strong>الابتكار:</strong> تطوير مستمر</li><li><strong>الموثوقية:</strong> متاح 24/7</li><li><strong>خدمة العملاء:</strong> دائماً جاهزين</li></ul>`,
            en: `<h1>About Us</h1>
<h2>Our Mission</h2><div class="highlight"><p>Empowering companies to manage sales teams efficiently through a smart platform.</p></div>
<h2>Our Vision</h2><p>To be the leading sales management platform in the Middle East.</p>
<h2>Our Stats</h2><ul><li><strong>+500</strong> Companies</li><li><strong>+5,000</strong> Active Agents</li><li><strong>+100,000</strong> Registered Clients</li><li><strong>99.9%</strong> Uptime</li></ul>
<h2>Our Values</h2><ul><li><strong>Transparency:</strong> Clear in everything</li><li><strong>Innovation:</strong> Continuous development</li><li><strong>Reliability:</strong> Available 24/7</li><li><strong>Customer Service:</strong> Always ready</li></ul>`
        },
        contact: {
            ar: `<h1>اتصل بنا</h1><p>يسعدنا تلقي استفساراتك!</p>
<div class="highlight"><h3>📧 البريد الإلكتروني</h3><p>emadh5156@gmail.com</p></div>
<h2>ساعات العمل</h2><p>الأحد - الخميس: 9:00 ص - 6:00 م (توقيت القاهرة)</p><p>الجمعة والسبت: مغلق</p>
<h2>تواصل معنا</h2><p>يمكنك أيضاً التواصل عبر نموذج اتصل بنا في التطبيق.</p>`,
            en: `<h1>Contact Us</h1><p>We'd love to hear from you!</p>
<div class="highlight"><h3>📧 Email</h3><p>emadh5156@gmail.com</p></div>
<h2>Working Hours</h2><p>Sunday - Thursday: 9:00 AM - 6:00 PM (Cairo time)</p><p>Friday & Saturday: Closed</p>
<h2>Get in Touch</h2><p>You can also reach us through the contact form in the app.</p>`
        },
        adsense: {
            ar: `<h1>سياسة الإعلانات (AdSense)</h1><p class="highlight">SalesHub Pro — أبريل 2026</p>
<h2>شروط Google AdSense (11 شرط)</h2><ol>
<li>عدم النقر على إعلاناتك</li><li>عدم تشجيع النقر</li><li>عدم تعديل كود الإعلانات</li><li>عدم وضع إعلانات على صفحات بدون محتوى</li><li>عدم استخدام محتوى محمي</li><li>عدم إعلانات على صفحات ببرمجيات خبيثة</li><li>عدم إخفاء الإعلانات</li><li>الامتثال لسياسات المحتوى</li><li>عدم إعلانات في نوافذ منبثقة</li><li>عدم التلاعب بـ CTR</li><li>نسبة معقولة من المحتوى مقابل الإعلانات</li></ol>
<h2>Cookies والإعلانات</h2><p>يستخدم Google AdSense cookies لعرض إعلانات بناءً على زياراتك.</p>
<h2>خدمات أطراف ثالثة</h2><ul><li>Google AdSense للإعلانات</li><li>Google Analytics للتحليلات</li><li>خدمات CDN للتحميل السريع</li></ul>
<h2>اختياراتك</h2><p>يمكنك إلغاء الاشتراك في الإعلانات المخصصة من <a href="https://www.google.com/settings/ads" target="_blank">إعدادات Google</a>.</p>`,
            en: `<h1>AdSense Policy</h1><p class="highlight">SalesHub Pro — April 2026</p>
<h2>Google AdSense Terms (11 conditions)</h2><ol>
<li>Don't click your own ads</li><li>Don't encourage clicks</li><li>Don't modify ad code</li><li>No ads on content-less pages</li><li>No copyrighted content</li><li>No ads on malware pages</li><li>Don't hide ads</li><li>Comply with content policies</li><li>No pop-up ads</li><li>Don't manipulate CTR</li><li>Reasonable content-to-ad ratio</li></ol>
<h2>Cookies & Ads</h2><p>Google AdSense uses cookies to show ads based on your visits.</p>
<h2>Third-Party Services</h2><ul><li>Google AdSense for ads</li><li>Google Analytics for analytics</li><li>CDN services for fast loading</li></ul>
<h2>Your Choices</h2><p>You can opt out of personalized ads via <a href="https://www.google.com/settings/ads" target="_blank">Google Settings</a>.</p>`
        },
        googleplay: {
            ar: `<h1>شروط Google Play</h1><p class="highlight">SalesHub Pro — أبريل 2026</p>
<h2>سياسة المحتوى</h2><p>يلتزم SalesHub Pro بجميع سياسات Google Play.</p>
<h2>الصلاحيات</h2><ul><li>الإنترنت: التزامن والبيانات</li><li>الإشعارات: إشعارات النظام</li><li>التخزين: حفظ البيانات محلياً</li></ul>
<h2>المشتريات داخل التطبيق</h2><p>عبر نظام فوترة Google Play.</p>
<h2>الإلغاء</h2><p>يمكنك الإلغاء من إعدادات حساب Google.</p>`,
            en: `<h1>Google Play Terms</h1><p class="highlight">SalesHub Pro — April 2026</p>
<h2>Content Policy</h2><p>SalesHub Pro complies with all Google Play policies.</p>
<h2>Permissions</h2><ul><li>Internet: Sync and data</li><li>Notifications: System alerts</li><li>Storage: Local data saving</li></ul>
<h2>In-App Purchases</h2><p>Through Google Play billing system.</p>
<h2>Cancellation</h2><p>You can cancel through Google account settings.</p>`
        },
        appstore: {
            ar: `<h1>شروط App Store</h1><p class="highlight">SalesHub Pro — أبريل 2026</p>
<h2>إرشادات Apple</h2><p>يلتزم SalesHub Pro بجميع إرشادات Apple.</p>
<h2>الخصوصية</h2><ul><li>الحد الأدنى من البيانات</li><li>لا نبيع البيانات</li><li>شفافية كاملة</li></ul>
<h2>الاشتراكات</h2><ul><li>تجديد تلقائي</li><li>الإلغاء من Apple ID</li><li>لا استرداد للفترات غير المستخدمة</li></ul>
<h2>Sign in with Apple</h2><p>ندعم تسجيل الدخول عبر Apple.</p>`,
            en: `<h1>App Store Terms</h1><p class="highlight">SalesHub Pro — April 2026</p>
<h2>Apple Guidelines</h2><p>SalesHub Pro complies with all Apple review guidelines.</p>
<h2>Privacy</h2><ul><li>Minimum data collection</li><li>We don't sell data</li><li>Full transparency</li></ul>
<h2>Subscriptions</h2><ul><li>Auto-renewal</li><li>Cancel via Apple ID</li><li>No refund for unused periods</li></ul>
<h2>Sign in with Apple</h2><p>We support Apple Sign In for your privacy.</p>`
        }
    };
    const el = document.getElementById(page+'Content');
    if (el && content[page]) el.innerHTML = content[page][isAr?'ar':'en'];
}

// ==================== TOGGLE PASS ====================
function togglePass(id) {
    const inp = document.getElementById(id);
    inp.type = inp.type==='password'?'text':'password';
    inp.parentElement.querySelector('.toggle-pass i').className = inp.type==='password'?'fas fa-eye':'fas fa-eye-slash';
}

// ==================== INIT ====================
function init() {
    applyTheme();
    applyLang();

    // Back to top
    window.addEventListener('scroll', () => {
        document.getElementById('backToTop').classList.toggle('hidden', window.scrollY < 300);
    });

    // Restore session
    const saved = DB.get('currentUser');
    if (saved) {
        S.user = saved;
        // Verify user still exists
        const d = DB.all();
        const found = d.users.find(u=>u.id===saved.id);
        if (found) { S.user = found; postLogin(); }
        else { DB.del('currentUser'); }
    }

    // Splash
    setTimeout(() => {
        document.getElementById('splash').classList.add('fade-out');
        document.getElementById('app').classList.remove('hidden');
        setTimeout(() => document.getElementById('splash').remove(), 600);
    }, 1500);
}

document.addEventListener('DOMContentLoaded', init);
