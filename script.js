// ========== تنظیمات JSONBin ==========
const API_KEY = '$2a$10$6i4ZDBhWPXQ2wKIi/Q/nj.KQNJ18otiZOHDlzXrT/GsV4DB0tUrs.';
const BIN_ID = '6a6356a4f5f4af5e29bb2fd2';

// ========== توابع JSONBin ==========
async function loadFromJSONBin() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) throw new Error('مشکل در خواندن اطلاعات');
        
        const data = await response.json();
        return data.record.responses || [];
    } catch (error) {
        console.error('خطا در خواندن:', error);
        return [];
    }
}

async function saveToJSONBin(responses) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ responses: responses })
        });
        
        if (!response.ok) throw new Error('مشکل در ذخیره');
        
        return await response.json();
    } catch (error) {
        console.error('خطا در ذخیره:', error);
        return null;
    }
}

// ========== کد اصلی ==========
(function() {
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const btnGroup = document.getElementById('btnGroup');
    const questionSection = document.getElementById('questionSection');
    const dateSection = document.getElementById('dateSection');
    const datePicker = document.getElementById('datePicker');
    const timePicker = document.getElementById('timePicker');
    const locationPicker = document.getElementById('locationPicker');
    const confirmDateBtn = document.getElementById('confirmDateBtn');
    const backBtn = document.getElementById('backBtn');
    const resultMessage = document.getElementById('resultMessage');
    const calendarModal = document.getElementById('calendarModal');
    const jalaliCalendar = document.getElementById('jalaliCalendar');
    const showCalendarBtn = document.getElementById('showCalendarBtn');
    const closeCalendarBtn = document.getElementById('closeCalendarBtn');
    
    const adminLoginPanel = document.getElementById('adminLoginPanel');
    const adminPanel = document.getElementById('adminPanel');
    const openAdminBtn = document.getElementById('openAdminBtn');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const adminUsername = document.getElementById('adminUsername');
    const adminPassword = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLoginError = document.getElementById('adminLoginError');
    const totalResponses = document.getElementById('totalResponses');
    const acceptedCount = document.getElementById('acceptedCount');
    const rejectedCount = document.getElementById('rejectedCount');
    const responsesList = document.getElementById('responsesList');

    const ADMIN_USER = 'mani';
    const ADMIN_PASS = '1386';

    // ========== وضعیت پاسخ (کاملاً بی‌نام) ==========
    let userResponse = {
        answered: false,
        accepted: false,
        date: null,
        time: null,
        location: null,
        timestamp: null,        // زمان ثبت (برای تشخیص)
        timestampFull: null,    // زمان کامل با ثانیه
        device: null
    };

    let isAdminLoggedIn = false;
    let allResponses = [];

    // ========== گرفتن زمان دقیق ==========
    function getPersianTimestamp() {
        const now = new Date();
        return now.toLocaleString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    // ========== بارگذاری اطلاعات ==========
    async function loadAllResponses() {
        allResponses = await loadFromJSONBin();
        console.log('📥 اطلاعات از سرور:', allResponses);
        if (isAdminLoggedIn) updateAdminPanel();
    }

    // ========== ذخیره پاسخ جدید ==========
    async function saveNewResponse() {
        const now = new Date();
        allResponses.push({
            ...userResponse,
            id: Date.now().toString(),
            timestamp: getPersianTimestamp(),
            timestampRaw: now.toISOString(), // برای مرتب‌سازی دقیق
            device: navigator.userAgent.includes('Mobile') ? '📱 موبایل' : '💻 کامپیوتر'
        });
        await saveToJSONBin(allResponses);
        console.log('✅ اطلاعات ذخیره شد!');
    }

    // ========== آپدیت پنل مدیریت ==========
    function updateAdminPanel() {
        if (!isAdminLoggedIn) return;
        
        // آمار
        totalResponses.textContent = allResponses.length;
        const accepted = allResponses.filter(r => r.accepted && r.date && r.time).length;
        const rejected = allResponses.filter(r => r.answered && !r.accepted).length;
        acceptedCount.textContent = accepted;
        rejectedCount.textContent = rejected;
        
        // لیست پاسخ‌ها
        if (allResponses.length === 0) {
            responsesList.innerHTML = '<p style="color: #7f8c8d; text-align: center; padding: 1rem;">هنوز پاسخی ثبت نشده</p>';
            return;
        }
        
        let html = '';
        // مرتب‌سازی از جدید به قدیم بر اساس زمان
        const sorted = [...allResponses].sort((a, b) => {
            return new Date(b.timestampRaw) - new Date(a.timestampRaw);
        });
        
        sorted.forEach((resp, index) => {
            const status = resp.accepted && resp.date && resp.time ? '✅ قبول' : 
                          resp.answered && !resp.accepted ? '❌ رد' : '⏳ ناقص';
            const statusColor = resp.accepted && resp.date && resp.time ? '#27ae60' : 
                               resp.answered && !resp.accepted ? '#e74c6f' : '#f39c12';
            
            html += `
                <div style="background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-right: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <span style="font-weight: 700; color: #2c3e50; font-size: 0.9rem;">
                            🕐 ${resp.timestamp || 'نامشخص'}
                        </span>
                        <span style="color: ${statusColor}; font-weight: 600;">${status}</span>
                    </div>
                    ${resp.accepted && resp.date && resp.time ? `
                        <div style="margin-top: 0.5rem; color: #555; font-size: 0.95rem;">
                            📅 ${resp.date} &nbsp;|&nbsp; 🕐 ${resp.time} &nbsp;|&nbsp; 📍 ${resp.location || '-'}
                        </div>
                        <div style="color: #999; font-size: 0.8rem; margin-top: 0.3rem;">
                            ${resp.device || ''}
                        </div>
                    ` : `
                        <div style="margin-top: 0.5rem; color: ${statusColor}; font-size: 0.9rem;">
                            ${resp.accepted ? 'در حال انتخاب جزئیات...' : 
                              resp.answered && !resp.accepted ? '❌ نه گفته' : 'در انتظار پاسخ'}
                        </div>
                    `}
                </div>
            `;
        });
        
        responsesList.innerHTML = html;
    }

    // ========== توابع فرار دکمه No ==========
    function getBtnGroupRect() {
        return btnGroup.getBoundingClientRect();
    }

    function getNoBtnRect() {
        return noBtn.getBoundingClientRect();
    }

    function fleeNoButton() {
        if (!noBtn || noBtn.style.display === 'none') return;

        const groupRect = getBtnGroupRect();
        const noRect = getNoBtnRect();

        const padding = 12;
        const maxX = groupRect.width - noRect.width - padding;
        const maxY = groupRect.height - noRect.height - padding;

        if (maxX <= 0 || maxY <= 0) {
            const currentLeft = parseFloat(noBtn.style.left) || 0;
            const currentTop = parseFloat(noBtn.style.top) || 0;
            const newLeft = Math.min(Math.max(currentLeft + (Math.random() * 20 - 10), -10), groupRect.width - noRect.width + 10);
            const newTop = Math.min(Math.max(currentTop + (Math.random() * 20 - 10), -10), groupRect.height - noRect.height + 10);
            noBtn.style.left = newLeft + 'px';
            noBtn.style.top = newTop + 'px';
            return;
        }

        let currentLeft = parseFloat(noBtn.style.left) || 0;
        let currentTop = parseFloat(noBtn.style.top) || 0;

        currentLeft = Math.min(Math.max(currentLeft, 0), maxX);
        currentTop = Math.min(Math.max(currentTop, 0), maxY);

        let newLeft, newTop;
        let attempts = 0;
        const maxAttempts = 40;

        do {
            newLeft = Math.random() * maxX;
            newTop = Math.random() * maxY;
            attempts++;
            const diffX = Math.abs(newLeft - currentLeft);
            const diffY = Math.abs(newTop - currentTop);
            if (diffX < 30 && diffY < 30 && attempts < maxAttempts) {
                continue;
            }
            break;
        } while (attempts < maxAttempts);

        noBtn.style.left = newLeft + 'px';
        noBtn.style.top = newTop + 'px';
    }

    function setInitialNoPosition() {
        noBtn.style.position = 'absolute';
        noBtn.style.left = '0px';
        noBtn.style.top = '0px';
        requestAnimationFrame(() => {
            const groupRect = getBtnGroupRect();
            const noRect = getNoBtnRect();
            if (noRect.width === 0 || groupRect.width === 0) {
                setTimeout(setInitialNoPosition, 50);
                return;
            }
            const leftPos = (groupRect.width - noRect.width) / 2;
            const topPos = (groupRect.height - noRect.height) / 2;
            noBtn.style.left = Math.max(0, leftPos) + 'px';
            noBtn.style.top = Math.max(0, topPos) + 'px';
        });
    }

    function resetNoToCenter() {
        const groupRect = getBtnGroupRect();
        const noRect = getNoBtnRect();
        if (noRect.width === 0 || groupRect.width === 0) {
            setTimeout(resetNoToCenter, 30);
            return;
        }
        const leftPos = (groupRect.width - noRect.width) / 2;
        const topPos = (groupRect.height - noRect.height) / 2;
        noBtn.style.left = Math.max(0, leftPos) + 'px';
        noBtn.style.top = Math.max(0, topPos) + 'px';
    }

    setInitialNoPosition();

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (noBtn.style.display !== 'none') {
                resetNoToCenter();
            }
        }, 200);
    });

    noBtn.addEventListener('mouseenter', function(e) {
        if (noBtn.style.display === 'none') return;
        fleeNoButton();
    });

    noBtn.addEventListener('mousemove', function(e) {
        if (noBtn.style.display === 'none') return;
        fleeNoButton();
    });

    noBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (noBtn.style.display === 'none') return;
        fleeNoButton();
        noBtn.style.background = '#ffaaaa';
        setTimeout(() => {
            noBtn.style.background = '#ecf0f1';
        }, 150);
    });

    noBtn.setAttribute('tabindex', '-1');

    // ========== تقویم شمسی ==========
    function showCalendar() {
        calendarModal.style.display = 'flex';
        generateJalaliCalendar();
    }

    function generateJalaliCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
        const persianYear = year - 621;
        const persianMonth = (month + 2) % 12 || 12;
        
        let html = `<h4 style="color: #e74c6f; margin-bottom: 1rem; font-size: 1.2rem;">${persianYear} ${persianMonths[persianMonth-1]}</h4>`;
        html += `<table><tr><th>ش</th><th>ی</th><th>د</th><th>س</th><th>چ</th><th>پ</th><th>ج</th></tr><tr>`;
        
        for (let i = 0; i < firstDay; i++) {
            html += `<td class="other-month"></td>`;
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            if ((i + firstDay - 1) % 7 === 0 && i > 1) {
                html += `</tr><tr>`;
            }
            const isToday = (i === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            html += `<td class="${isToday ? 'today' : ''}" data-day="${i}" data-month="${month}" data-year="${year}">${i}</td>`;
        }
        
        html += `</tr></table>`;
        jalaliCalendar.innerHTML = html;
        
        document.querySelectorAll('#jalaliCalendar td[data-day]').forEach(td => {
            td.addEventListener('click', function() {
                const day = this.dataset.day;
                const month = this.dataset.month;
                const year = this.dataset.year;
                const persianDay = parseInt(day) + 10;
                const persianMonth = (parseInt(month) + 2) % 12 || 12;
                const persianYear = parseInt(year) - 621;
                const persianDate = `${persianYear}/${String(persianMonth).padStart(2, '0')}/${String(persianDay).padStart(2, '0')}`;
                datePicker.value = persianDate;
                calendarModal.style.display = 'none';
            });
        });
    }

    // ========== رویدادها ==========
    yesBtn.addEventListener('click', function() {
        userResponse.answered = true;
        userResponse.accepted = true;
        
        questionSection.style.display = 'none';
        dateSection.style.display = 'block';
        resultMessage.textContent = '';
    });

    showCalendarBtn.addEventListener('click', showCalendar);

    closeCalendarBtn.addEventListener('click', function() {
        calendarModal.style.display = 'none';
    });

    calendarModal.addEventListener('click', function(e) {
        if (e.target === calendarModal) {
            calendarModal.style.display = 'none';
        }
    });

    backBtn.addEventListener('click', function() {
        dateSection.style.display = 'none';
        questionSection.style.display = 'block';
        resultMessage.textContent = '';
        userResponse.accepted = false;
        userResponse.date = null;
        userResponse.time = null;
        userResponse.location = null;
    });

    confirmDateBtn.addEventListener('click', async function() {
        const date = datePicker.value.trim();
        const time = timePicker.value.trim();
        const location = locationPicker.value.trim();
        
        if (!date) {
            resultMessage.textContent = '⚠️ لطفاً تاریخ رو انتخاب کن!';
            resultMessage.style.color = '#e74c6f';
            return;
        }
        if (!time) {
            resultMessage.textContent = '⚠️ لطفاً ساعت رو انتخاب کن!';
            resultMessage.style.color = '#e74c6f';
            return;
        }
        if (!location) {
            resultMessage.textContent = '⚠️ لطفاً مکان رو مشخص کن!';
            resultMessage.style.color = '#e74c6f';
            return;
        }
        
        userResponse.date = date;
        userResponse.time = time;
        userResponse.location = location;
        
        // ذخیره با زمان دقیق
        await saveNewResponse();
        
        if (isAdminLoggedIn) updateAdminPanel();
        
        resultMessage.style.color = '#27ae60';
        resultMessage.innerHTML = `✅ عالی! قرار دیت برای <strong>${date}</strong> ساعت <strong>${time}</strong> در <strong>${location}</strong> ثبت شد! 🎉<br>منتظرتم! 💖`;
        
        confirmDateBtn.disabled = true;
        confirmDateBtn.style.opacity = '0.5';
        confirmDateBtn.style.cursor = 'not-allowed';
    });

    // ========== پنل مدیریت ==========
    openAdminBtn.addEventListener('click', function() {
        if (isAdminLoggedIn) {
            adminPanel.style.display = 'block';
            adminLoginPanel.style.display = 'none';
            openAdminBtn.textContent = '🔒 بستن مدیریت';
            updateAdminPanel();
        } else {
            adminLoginPanel.style.display = 'block';
            adminPanel.style.display = 'none';
            openAdminBtn.textContent = '🔒 بستن مدیریت';
            adminLoginError.textContent = '';
            adminUsername.value = '';
            adminPassword.value = '';
        }
    });

    adminLoginBtn.addEventListener('click', function() {
        const username = adminUsername.value.trim();
        const password = adminPassword.value.trim();
        
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            isAdminLoggedIn = true;
            adminLoginPanel.style.display = 'none';
            adminPanel.style.display = 'block';
            adminLoginError.textContent = '';
            loadAllResponses().then(() => updateAdminPanel());
        } else {
            adminLoginError.textContent = '❌ نام کاربری یا رمز اشتباه است!';
        }
    });

    adminPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adminLoginBtn.click();
        }
    });

    adminUsername.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adminLoginBtn.click();
        }
    });

    closeAdminBtn.addEventListener('click', function() {
        isAdminLoggedIn = false;
        adminPanel.style.display = 'none';
        adminLoginPanel.style.display = 'none';
        openAdminBtn.textContent = '🛠️ مدیریت';
    });

    // ========== شروع برنامه ==========
    loadAllResponses();

    console.log('🚀 پروژه قرار دیت با خانم خوشگله آماده است!');
    console.log('📡 اطلاعات در JSONBin ذخیره میشود');
    console.log('👤 نام کاربری: mani | رمز: 1386');
    console.log('🕵️‍♂️ کاملاً بی‌نام - فقط با زمان ثبت تشخیص بده!');
})();