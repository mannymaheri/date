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
    
    // المان‌های پنل مدیریت
    const adminLoginPanel = document.getElementById('adminLoginPanel');
    const adminPanel = document.getElementById('adminPanel');
    const openAdminBtn = document.getElementById('openAdminBtn');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const adminUsername = document.getElementById('adminUsername');
    const adminPassword = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLoginError = document.getElementById('adminLoginError');
    const adminResponse = document.getElementById('adminResponse');
    const adminDate = document.getElementById('adminDate');
    const adminTime = document.getElementById('adminTime');
    const adminLocation = document.getElementById('adminLocation');
    const adminTimestamp = document.getElementById('adminTimestamp');

    // اطلاعات کاربری مدیریت
    const ADMIN_USER = 'mani';
    const ADMIN_PASS = '1386';

    // ========== بارگذاری اطلاعات ذخیره شده ==========
    function loadSavedData() {
        const saved = localStorage.getItem('dateResponse');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                return data;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // ========== ذخیره اطلاعات ==========
    function saveData(data) {
        localStorage.setItem('dateResponse', JSON.stringify(data));
    }

    // ========== مقداردهی اولیه از localStorage ==========
    let userResponse = loadSavedData() || {
        answered: false,
        accepted: false,
        date: null,
        time: null,
        location: null,
        timestamp: null
    };

    let isAdminLoggedIn = false;

    // ========== بازیابی وضعیت صفحه بر اساس اطلاعات ذخیره شده ==========
    function restoreFromSavedData() {
        if (userResponse.accepted && userResponse.date && userResponse.time && userResponse.location) {
            // اگر قبلا تایید کرده
            questionSection.style.display = 'none';
            dateSection.style.display = 'block';
            datePicker.value = userResponse.date || '';
            timePicker.value = userResponse.time || '';
            locationPicker.value = userResponse.location || '';
            
            resultMessage.style.color = '#27ae60';
            resultMessage.innerHTML = `✅ عالی! قرار دیت برای <strong>${userResponse.date}</strong> ساعت <strong>${userResponse.time}</strong> در <strong>${userResponse.location}</strong> ثبت شد! 🎉<br>منتظرتم! 💖`;
            
            confirmDateBtn.disabled = true;
            confirmDateBtn.style.opacity = '0.5';
            confirmDateBtn.style.cursor = 'not-allowed';
        } else if (userResponse.answered && userResponse.accepted) {
            // اگر فقط بله گفته ولی هنوز تایید نکرده
            questionSection.style.display = 'none';
            dateSection.style.display = 'block';
            if (userResponse.date) datePicker.value = userResponse.date;
            if (userResponse.time) timePicker.value = userResponse.time;
            if (userResponse.location) locationPicker.value = userResponse.location;
        }
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

    // ========== آپدیت پنل مدیریت ==========
    function updateAdminPanel() {
        if (!isAdminLoggedIn) return;
        
        if (userResponse.accepted && userResponse.date && userResponse.time) {
            adminResponse.textContent = '✅ قبول کرده!';
            adminResponse.className = 'admin-value accepted';
            adminDate.textContent = userResponse.date || '-';
            adminTime.textContent = userResponse.time || '-';
            adminLocation.textContent = userResponse.location || '-';
            adminTimestamp.textContent = userResponse.timestamp || '-';
        } else if (userResponse.answered && !userResponse.accepted) {
            adminResponse.textContent = '❌ نه گفته';
            adminResponse.className = 'admin-value';
            adminDate.textContent = '-';
            adminTime.textContent = '-';
            adminLocation.textContent = '-';
            adminTimestamp.textContent = userResponse.timestamp || '-';
        } else if (userResponse.accepted && !userResponse.date) {
            adminResponse.textContent = '⏳ در حال انتخاب';
            adminResponse.className = 'admin-value waiting';
            adminDate.textContent = '-';
            adminTime.textContent = '-';
            adminLocation.textContent = '-';
            adminTimestamp.textContent = userResponse.timestamp || '-';
        } else {
            adminResponse.textContent = '⏳ در انتظار پاسخ';
            adminResponse.className = 'admin-value waiting';
            adminDate.textContent = '-';
            adminTime.textContent = '-';
            adminLocation.textContent = '-';
            adminTimestamp.textContent = '-';
        }
    }

    // ========== رویدادها ==========
    yesBtn.addEventListener('click', function() {
        userResponse.answered = true;
        userResponse.accepted = true;
        userResponse.timestamp = new Date().toLocaleString('fa-IR');
        saveData(userResponse);
        
        questionSection.style.display = 'none';
        dateSection.style.display = 'block';
        resultMessage.textContent = '';
        if (isAdminLoggedIn) updateAdminPanel();
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
        saveData(userResponse);
        if (isAdminLoggedIn) updateAdminPanel();
    });

    confirmDateBtn.addEventListener('click', function() {
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
        userResponse.timestamp = new Date().toLocaleString('fa-IR');
        saveData(userResponse);
        
        if (isAdminLoggedIn) updateAdminPanel();
        
        resultMessage.style.color = '#27ae60';
        resultMessage.innerHTML = `✅ عالی! قرار دیت برای <strong>${date}</strong> ساعت <strong>${time}</strong> در <strong>${location}</strong> ثبت شد! 🎉<br>منتظرتم! 💖`;
        
        confirmDateBtn.disabled = true;
        confirmDateBtn.style.opacity = '0.5';
        confirmDateBtn.style.cursor = 'not-allowed';
    });

    // ========== پنل مدیریت با لاگین ==========
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
            updateAdminPanel();
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

    // ========== بازیابی اطلاعات در شروع ==========
    restoreFromSavedData();

    console.log('🚀 پروژه قرار دیت با خانم خوشگله آماده است!');
    console.log('📌 اطلاعات در مرورگر ذخیره میشود');
})();