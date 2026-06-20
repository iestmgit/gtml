// ---------- حالت ذخیره‌سازی ----------
let objects = [];
let selectedObject = null;
let nextId = 1;
let dragTarget = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;

// ---------- عناصر DOM ----------
const scene = document.getElementById('scene');
const dropZone = document.getElementById('dropZone');
const propX = document.getElementById('propX');
const propY = document.getElementById('propY');
const propW = document.getElementById('propW');
const propH = document.getElementById('propH');
const propColor = document.getElementById('propColor');
const propText = document.getElementById('propText');
const deleteBtn = document.getElementById('deleteBtn');
const status = document.getElementById('status');
const objectCount = document.getElementById('objectCount');

// ---------- ایجاد المان جدید ----------
function createObject(type, x = 100, y = 100, w = 120, h = 80, color = '#6c5ce7', text = '') {
    const obj = {
        id: nextId++,
        type: type,
        x: x,
        y: y,
        width: w,
        height: h,
        color: color,
        text: text || getDefaultText(type),
        rotation: 0,
        fontSize: 20
    };
    objects.push(obj);
    renderObject(obj);
    updateStatus();
    return obj;
}

function getDefaultText(type) {
    const map = {
        'rect': 'مستطیل',
        'circle': 'دایره',
        'text': 'متن',
        'image': 'تصویر',
        'button': 'کلیک کن'
    };
    return map[type] || 'شیء';
}

// ---------- رندر کردن یک شیء ----------
function renderObject(obj) {
    // حذف المان قبلی اگر وجود داشت
    const oldEl = document.querySelector(`.scene-object[data-id="${obj.id}"]`);
    if (oldEl) oldEl.remove();

    const el = document.createElement('div');
    el.className = 'scene-object';
    el.dataset.id = obj.id;
    el.style.left = obj.x + 'px';
    el.style.top = obj.y + 'px';
    el.style.width = obj.width + 'px';
    el.style.height = obj.height + 'px';
    el.style.backgroundColor = obj.color;
    el.style.color = '#fff';
    el.style.fontSize = obj.fontSize + 'px';
    el.style.transform = `rotate(${obj.rotation || 0}deg)`;

    // محتوای خاص بر اساس نوع
    if (obj.type === 'circle') {
        el.style.borderRadius = '50%';
    } else {
        el.style.borderRadius = '8px';
    }

    if (obj.type === 'text') {
        el.style.backgroundColor = 'transparent';
        el.style.color = obj.color;
        el.textContent = obj.text;
    } else if (obj.type === 'button') {
        el.textContent = obj.text;
        el.style.cursor = 'pointer';
        el.style.border = 'none';
        el.style.borderRadius = '12px';
        el.style.fontWeight = 'bold';
        el.style.boxShadow = '0 4px 15px rgba(108, 92, 231, 0.4)';
    } else if (obj.type === 'image') {
        el.style.backgroundImage = `url(${obj.imageUrl || 'https://via.placeholder.com/100/6c5ce7/fff?text=img'})`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.textContent = '';
    } else {
        el.textContent = obj.text || '';
    }

    // دکمه حذف
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteObject(obj.id);
    });
    el.appendChild(delBtn);

    // رویدادهای ماوس
    el.addEventListener('mousedown', (e) => {
        selectObject(obj.id);
        startDrag(e, obj.id);
    });

    el.addEventListener('dblclick', () => {
        if (obj.type === 'button') {
            alert(`🔘 دکمه "${obj.text}" کلیک شد!`);
        }
    });

    scene.appendChild(el);
    dropZone.style.display = 'none';
}

// ---------- انتخاب شیء ----------
function selectObject(id) {
    // حذف انتخاب قبلی
    document.querySelectorAll('.scene-object').forEach(el => el.classList.remove('selected'));
    selectedObject = objects.find(o => o.id === id);
    if (selectedObject) {
        const el = document.querySelector(`.scene-object[data-id="${id}"]`);
        if (el) el.classList.add('selected');
        updateProperties();
    }
}

// ---------- به‌روزرسانی پنل تنظیمات ----------
function updateProperties() {
    if (!selectedObject) {
        propX.value = '';
        propY.value = '';
        propW.value = '';
        propH.value = '';
        propColor.value = '#6c5ce7';
        propText.value = '';
        return;
    }
    const o = selectedObject;
    propX.value = o.x;
    propY.value = o.y;
    propW.value = o.width;
    propH.value = o.height;
    propColor.value = o.color;
    propText.value = o.text || '';
}

// ---------- حذف شیء ----------
function deleteObject(id) {
    objects = objects.filter(o => o.id !== id);
    const el = document.querySelector(`.scene-object[data-id="${id}"]`);
    if (el) el.remove();
    if (selectedObject && selectedObject.id === id) {
        selectedObject = null;
        updateProperties();
    }
    updateStatus();
    if (objects.length === 0) dropZone.style.display = 'block';
}

// ---------- کشیدن (Drag) ----------
function startDrag(e, id) {
    const obj = objects.find(o => o.id === id);
    if (!obj) return;
    const el = document.querySelector(`.scene-object[data-id="${id}"]`);
    if (!el) return;

    const rect = scene.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    offsetX = e.clientX - elRect.left;
    offsetY = e.clientY - elRect.top;
    isDragging = true;
    dragTarget = id;

    el.style.cursor = 'grabbing';
}

document.addEventListener('mousemove', (e) => {
    if (!isDragging || dragTarget === null) return;
    const obj = objects.find(o => o.id === dragTarget);
    if (!obj) return;

    const rect = scene.getBoundingClientRect();
    let newX = e.clientX - rect.left - offsetX;
    let newY = e.clientY - rect.top - offsetY;

    // محدود کردن به داخل صحنه
    newX = Math.max(0, Math.min(newX, scene.clientWidth - obj.width));
    newY = Math.max(0, Math.min(newY, scene.clientHeight - obj.height));

    obj.x = newX;
    obj.y = newY;

    const el = document.querySelector(`.scene-object[data-id="${dragTarget}"]`);
    if (el) {
        el.style.left = newX + 'px';
        el.style.top = newY + 'px';
    }
    if (selectedObject && selectedObject.id === dragTarget) {
        updateProperties();
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        const el = document.querySelector(`.scene-object[data-id="${dragTarget}"]`);
        if (el) el.style.cursor = 'move';
        isDragging = false;
        dragTarget = null;
    }
});

// ---------- به‌روزرسانی وضعیت ----------
function updateStatus() {
    objectCount.textContent = `اشیاء: ${objects.length}`;
    status.textContent = `✅ ${objects.length} شیء در صحنه`;
}

// ---------- ابزارها: Drag & Drop از پنل به صحنه ----------
document.querySelectorAll('.tool-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('type', item.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
    });
});

scene.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

scene.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if (!type) return;

    const rect = scene.getBoundingClientRect();
    let x = e.clientX - rect.left - 60;
    let y = e.clientY - rect.top - 40;

    // محدود کردن
    x = Math.max(0, Math.min(x, scene.clientWidth - 120));
    y = Math.max(0, Math.min(y, scene.clientHeight - 80));

    const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    const obj = createObject(type, x, y, 120, 80, color);
    selectObject(obj.id);
    status.textContent = `✅ ${type} اضافه شد!`;
});

// ---------- پنل تنظیمات: تغییرات ----------
propX.addEventListener('input', () => {
    if (!selectedObject) return;
    selectedObject.x = parseInt(propX.value) || 0;
    updateObjectPosition(selectedObject.id);
});

propY.addEventListener('input', () => {
    if (!selectedObject) return;
    selectedObject.y = parseInt(propY.value) || 0;
    updateObjectPosition(selectedObject.id);
});

propW.addEventListener('input', () => {
    if (!selectedObject) return;
    selectedObject.width = parseInt(propW.value) || 10;
    updateObjectSize(selectedObject.id);
});

propH.addEventListener('input', () => {
    if (!selectedObject) return;
    selectedObject.height = parseInt(propH.value) || 10;
    updateObjectSize(selectedObject.id);
});

propColor.addEventListener('input', () => {
    if (!selectedObject) return;
    selectedObject.color = propColor.value;
    const el = document.querySelector(`.scene-object[data-id="${selectedObject.id}"]`);
    if (el) {
        if (selectedObject.type === 'text') {
            el.style.color = propColor.value;
            el.style.backgroundColor = 'transparent';
        } else {
            el.style.backgroundColor = propColor.value;
        }
    }
});

propText.addEventListener('input', () => {
    if (!selectedObject) return;
    selectedObject.text = propText.value;
    const el = document.querySelector(`.scene-object[data-id="${selectedObject.id}"]`);
    if (el) {
        if (selectedObject.type === 'text' || selectedObject.type === 'button') {
            el.textContent = propText.value;
        } else {
            el.textContent = propText.value;
        }
    }
});

function updateObjectPosition(id) {
    const obj = objects.find(o => o.id === id);
    if (!obj) return;
    const el = document.querySelector(`.scene-object[data-id="${id}"]`);
    if (el) {
        el.style.left = obj.x + 'px';
        el.style.top = obj.y + 'px';
    }
}

function updateObjectSize(id) {
    const obj = objects.find(o => o.id === id);
    if (!obj) return;
    const el = document.querySelector(`.scene-object[data-id="${id}"]`);
    if (el) {
        el.style.width = obj.width + 'px';
        el.style.height = obj.height + 'px';
    }
}

// ---------- حذف با دکمه ----------
deleteBtn.addEventListener('click', () => {
    if (selectedObject) {
        deleteObject(selectedObject.id);
    }
});

// ---------- ذخیره پروژه (JSON) ----------
document.getElementById('saveBtn').addEventListener('click', () => {
    const data = {
        objects: objects,
        nextId: nextId,
        version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.iestm';
    a.click();
    URL.revokeObjectURL(url);
    status.textContent = '✅ پروژه ذخیره شد!';
});

// ---------- بارگذاری پروژه ----------
document.getElementById('loadBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.iestm, .json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                // پاک کردن صحنه
                document.querySelectorAll('.scene-object').forEach(el => el.remove());
                objects = data.objects || [];
                nextId = data.nextId || 1;
                objects.forEach(obj => renderObject(obj));
                updateStatus();
                dropZone.style.display = objects.length > 0 ? 'none' : 'block';
                selectedObject = null;
                updateProperties();
                status.textContent = `✅ پروژه بارگذاری شد (${objects.length} شیء)`;
            } catch (err) {
                alert('❌ فایل معتبر نیست!');
                status.textContent = '❌ خطا در بارگذاری';
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

// ---------- جدید ----------
document.getElementById('newBtn').addEventListener('click', () => {
    if (objects.length > 0 && !confirm('آیا مطمئن هستید؟ تغییرات ذخیره نشده از دست می‌روند.')) return;
    document.querySelectorAll('.scene-object').forEach(el => el.remove());
    objects = [];
    nextId = 1;
    selectedObject = null;
    updateProperties();
    updateStatus();
    dropZone.style.display = 'block';
    status.textContent = '📄 پروژه جدید';
});

// ---------- خروجی HTML (اجرای بازی) ----------
document.getElementById('exportBtn').addEventListener('click', () => {
    if (objects.length === 0) {
        alert('❌ صحنه خالی است! حداقل یک شیء اضافه کنید.');
        return;
    }

    // ساخت HTML برای بازی
    let html = `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>بازی ساخته شده با IESTM Game Studio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            background: #0a0a1a; 
            font-family: 'Segoe UI', Tahoma, sans-serif;
            overflow: hidden;
        }
        #game {
            width: 800px;
            height: 500px;
            background: #1a1a2e;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(108, 92, 231, 0.2);
        }
        .obj {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            border-radius: 8px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div id="game">`;

    objects.forEach(obj => {
        const style = `
            left:${obj.x}px; top:${obj.y}px; 
            width:${obj.width}px; height:${obj.height}px; 
            background:${obj.type === 'text' ? 'transparent' : obj.color};
            color:${obj.type === 'text' ? obj.color : '#fff'};
            font-size:${obj.fontSize || 20}px;
            border-radius:${obj.type === 'circle' ? '50%' : '8px'};
            ${obj.type === 'button' ? 'cursor:pointer;border:none;box-shadow:0 4px 15px rgba(108,92,231,0.4);' : ''}
            ${obj.type === 'image' ? `background-image:url(${obj.imageUrl || 'https://via.placeholder.com/100/6c5ce7/fff?text=img'});background-size:cover;` : ''}
            transform:rotate(${obj.rotation || 0}deg);
        `;
        const content = obj.type === 'text' || obj.type === 'button' ? obj.text : '';
        html += `<div class="obj" style="${style}">${content}</div>`;
    });

    html += `
    </div>
    <script>
        document.querySelectorAll('.obj').forEach(el => {
            el.addEventListener('click', () => {
                alert('🎮 شیء کلیک شد!');
            });
        });
    </script>
</body>
</html>`;

    // دانلود فایل HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.html';
    a.click();
    URL.revokeObjectURL(url);
    status.textContent = '🚀 خروجی HTML دانلود شد!';
});

// ---------- اجرا (پلی) ----------
document.getElementById('playBtn').addEventListener('click', () => {
    if (objects.length === 0) {
        alert('❌ صحنه خالی است!');
        return;
    }
    document.getElementById('exportBtn').click();
});

// ---------- کلیک روی صحنه برای لغو انتخاب ----------
scene.addEventListener('click', (e) => {
    if (e.target === scene || e.target === dropZone) {
        document.querySelectorAll('.scene-object').forEach(el => el.classList.remove('selected'));
        selectedObject = null;
        updateProperties();
    }
});

// ---------- شروع با یک نمونه ----------
// اضافه کردن چند شیء نمونه
setTimeout(() => {
    const rect = createObject('rect', 100, 80, 140, 90, '#6c5ce7', 'مستطیل');
    const circle = createObject('circle', 350, 60, 100, 100, '#e74c3c', 'دایره');
    const btn = createObject('button', 550, 100, 160, 60, '#2ecc71', 'شروع بازی');
    const text = createObject('text', 250, 250, 300, 50, '#f1c40f', 'به IESTM Game Studio خوش آمدید!');
    selectObject(rect.id);
    status.textContent = '🎮 نمونه بارگذاری شد!';
}, 300);

console.log('🎮 IESTM Game Studio Loaded!');
