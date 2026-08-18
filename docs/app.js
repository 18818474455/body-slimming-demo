// ==================== Constants ====================

const PART_COLORS = [
    [255, 110, 110], [255, 130, 120],   // 0-1: face
    [100, 190, 255], [100, 190, 255],   // 2-3: left upper arm
    [80, 160, 240],  [80, 160, 240],    // 4-5: right upper arm
    [140, 220, 190], [140, 220, 190],   // 6-7: left lower arm
    [110, 200, 170], [110, 200, 170],   // 8-9: right lower arm
    [255, 200, 100], [255, 200, 100],   // 10-11: hands
    [255, 150, 90],  [255, 130, 80],    // 12-13: torso
    [170, 120, 255], [170, 120, 255],   // 14-15: left upper leg
    [150, 100, 240], [150, 100, 240],   // 16-17: right upper leg
    [120, 210, 120], [120, 210, 120],   // 18-19: left lower leg
    [90, 190, 100],  [90, 190, 100],    // 20-21: right lower leg
    [255, 210, 140], [255, 210, 140],   // 22-23: feet
];

const PART_NAMES = [
    '左脸', '右脸',
    '左上臂(前)', '左上臂(后)', '右上臂(前)', '右上臂(后)',
    '左前臂(前)', '左前臂(后)', '右前臂(前)', '右前臂(后)',
    '左手', '右手',
    '躯干(前)', '躯干(后)',
    '左大腿(前)', '左大腿(后)', '右大腿(前)', '右大腿(后)',
    '左小腿(前)', '左小腿(后)', '右小腿(前)', '右小腿(后)',
    '左脚', '右脚',
];

const PART_GROUPS = {
    '面部': [0, 1],
    '上臂': [2, 3, 4, 5],
    '前臂': [6, 7, 8, 9],
    '手部': [10, 11],
    '躯干': [12, 13],
    '大腿': [14, 15, 16, 17],
    '小腿': [18, 19, 20, 21],
    '脚部': [22, 23],
};

const SKELETON = [
    [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
    [5, 11], [6, 12], [11, 12],
    [11, 13], [13, 15], [12, 14], [14, 16],
    [0, 1], [0, 2], [1, 3], [2, 4],
];

const KP_NAMES = [
    '鼻子', '左眼', '右眼', '左耳', '右耳',
    '左肩', '右肩', '左肘', '右肘',
    '左腕', '右腕', '左髋', '右髋',
    '左膝', '右膝', '左踝', '右踝',
];

const ZONE_SLIM_FACTORS = new Float32Array(24);
// face: 0
ZONE_SLIM_FACTORS[0] = 0; ZONE_SLIM_FACTORS[1] = 0;
// upper arms: 0.5
ZONE_SLIM_FACTORS[2] = 0.5; ZONE_SLIM_FACTORS[3] = 0.5;
ZONE_SLIM_FACTORS[4] = 0.5; ZONE_SLIM_FACTORS[5] = 0.5;
// lower arms: 0.3
ZONE_SLIM_FACTORS[6] = 0.3; ZONE_SLIM_FACTORS[7] = 0.3;
ZONE_SLIM_FACTORS[8] = 0.3; ZONE_SLIM_FACTORS[9] = 0.3;
// hands: 0
ZONE_SLIM_FACTORS[10] = 0; ZONE_SLIM_FACTORS[11] = 0;
// torso: 1.0
ZONE_SLIM_FACTORS[12] = 1.0; ZONE_SLIM_FACTORS[13] = 1.0;
// upper legs: 0.7
ZONE_SLIM_FACTORS[14] = 0.7; ZONE_SLIM_FACTORS[15] = 0.7;
ZONE_SLIM_FACTORS[16] = 0.7; ZONE_SLIM_FACTORS[17] = 0.7;
// lower legs: 0.4
ZONE_SLIM_FACTORS[18] = 0.4; ZONE_SLIM_FACTORS[19] = 0.4;
ZONE_SLIM_FACTORS[20] = 0.4; ZONE_SLIM_FACTORS[21] = 0.4;
// feet: 0.1
ZONE_SLIM_FACTORS[22] = 0.1; ZONE_SLIM_FACTORS[23] = 0.1;


// ==================== Main Class ====================

class BodySlimmer {
    constructor() {
        this.bodyPixModel = null;
        this.originalImage = null;
        this.maxCanvasSize = 640;
        this.modelsReady = false;
        this._slimRAF = 0;
        this.faceCount = 0;
        this.multiPersonBlocked = false;

        this.cachedSrcPixels = null;
        this.cachedPartData = null;
        this.cachedBodyMask = null;
        this.cachedPose = null;
        this.cachedW = 0;
        this.cachedH = 0;

        this.els = {
            statusBar: document.getElementById('statusBar'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            uploadCard: document.getElementById('uploadCard'),
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            previewCard: document.getElementById('previewCard'),
            resultsArea: document.getElementById('resultsArea'),
            originalCanvas: document.getElementById('originalCanvas'),
            // Face detection
            faceDetectCard: document.getElementById('faceDetectCard'),
            faceCanvas: document.getElementById('faceCanvas'),
            faceInfo: document.getElementById('faceInfo'),
            poseCanvas: document.getElementById('poseCanvas'),
            poseInfo: document.getElementById('poseInfo'),
            partCanvas: document.getElementById('partCanvas'),
            partInfo: document.getElementById('partInfo'),
            zoneCanvas: document.getElementById('zoneCanvas'),
            zoneInfo: document.getElementById('zoneInfo'),
            slimCard: document.getElementById('slimCard'),
            slimCanvas: document.getElementById('slimCanvas'),
            slimInfo: document.getElementById('slimInfo'),
            slimSlider: document.getElementById('slimSlider'),
            slimValue: document.getElementById('slimValue'),
            compareToggle: document.getElementById('compareToggle'),
            btnAlbum: document.getElementById('btnAlbum'),
            btnCamera: document.getElementById('btnCamera'),
            btnReselect: document.getElementById('btnReselect'),
            btnDetect: document.getElementById('btnDetect'),
            btnSave: document.getElementById('btnSave'),
            legSlimCard: document.getElementById('legSlimCard'),
            legSlimCanvas: document.getElementById('legSlimCanvas'),
            legSlimInfo: document.getElementById('legSlimInfo'),
            thighSlider: document.getElementById('thighSlider'),
            thighValue: document.getElementById('thighValue'),
            calfSlider: document.getElementById('calfSlider'),
            calfValue: document.getElementById('calfValue'),
            legCompareToggle: document.getElementById('legCompareToggle'),
            btnSaveLeg: document.getElementById('btnSaveLeg'),
            // Combined
            comboCard: document.getElementById('comboCard'),
            comboCanvas: document.getElementById('comboCanvas'),
            comboInfo: document.getElementById('comboInfo'),
            comboBodySlider: document.getElementById('comboBodySlider'),
            comboBodyValue: document.getElementById('comboBodyValue'),
            comboArmSlider: document.getElementById('comboArmSlider'),
            comboArmValue: document.getElementById('comboArmValue'),
            comboThighSlider: document.getElementById('comboThighSlider'),
            comboThighValue: document.getElementById('comboThighValue'),
            comboCalfSlider: document.getElementById('comboCalfSlider'),
            comboCalfValue: document.getElementById('comboCalfValue'),
            comboLegSlider: document.getElementById('comboLegSlider'),
            comboLegValue: document.getElementById('comboLegValue'),
            comboCompareToggle: document.getElementById('comboCompareToggle'),
            btnSaveCombo: document.getElementById('btnSaveCombo'),
            overlay: document.getElementById('overlay'),
            overlayText: document.getElementById('overlayText'),
            progressFill: document.getElementById('progressFill'),
        };

        this.bindEvents();
        this.loadModels();
    }

    // ==================== Events ====================

    bindEvents() {
        this.els.uploadArea.addEventListener('click', () => this.openAlbum());
        this.els.btnAlbum.addEventListener('click', () => this.openAlbum());
        this.els.btnCamera.addEventListener('click', () => this.openCamera());
        this.els.btnReselect.addEventListener('click', () => this.reset());
        this.els.btnDetect.addEventListener('click', () => this.runDetection());
        this.els.fileInput.addEventListener('change', (e) => this.onFileSelected(e));

        this.els.slimSlider.addEventListener('input', () => {
            this.els.slimValue.textContent = this.els.slimSlider.value + '%';
            cancelAnimationFrame(this._slimRAF);
            this._slimRAF = requestAnimationFrame(() => {
                this.applySlimming(parseInt(this.els.slimSlider.value));
            });
        });

        this.els.compareToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.compare-btn');
            if (!btn) return;
            this.els.compareToggle.querySelectorAll('.compare-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.mode === 'before') {
                this.showOriginalOnSlimCanvas();
            } else {
                this.applySlimming(parseInt(this.els.slimSlider.value));
            }
        });

        this.els.btnSave.addEventListener('click', () => this.saveResult());

        // Leg slimming events
        const scheduleLeg = () => {
            this.els.thighValue.textContent = this.els.thighSlider.value + '%';
            this.els.calfValue.textContent = this.els.calfSlider.value + '%';
            cancelAnimationFrame(this._legRAF);
            this._legRAF = requestAnimationFrame(() => {
                this.applyLegSlimming(parseInt(this.els.thighSlider.value), parseInt(this.els.calfSlider.value));
            });
        };
        this.els.thighSlider.addEventListener('input', scheduleLeg);
        this.els.calfSlider.addEventListener('input', scheduleLeg);

        this.els.legCompareToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.compare-btn');
            if (!btn) return;
            this.els.legCompareToggle.querySelectorAll('.compare-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.mode === 'before') {
                this.showOriginalOnCanvas(this.els.legSlimCanvas);
            } else {
                this.applyLegSlimming(parseInt(this.els.thighSlider.value), parseInt(this.els.calfSlider.value));
            }
        });

        this.els.btnSaveLeg.addEventListener('click', () => this.saveCanvasResult(this.els.legSlimCanvas, 'leg_slim_result.png'));

        // Combined events
        const getComboParams = () => [
            parseInt(this.els.comboBodySlider.value),
            parseInt(this.els.comboArmSlider.value),
            parseInt(this.els.comboThighSlider.value),
            parseInt(this.els.comboCalfSlider.value),
            parseInt(this.els.comboLegSlider.value),
        ];
        const scheduleCombo = () => {
            this.els.comboBodyValue.textContent = this.els.comboBodySlider.value + '%';
            this.els.comboArmValue.textContent = this.els.comboArmSlider.value + '%';
            this.els.comboThighValue.textContent = this.els.comboThighSlider.value + '%';
            this.els.comboCalfValue.textContent = this.els.comboCalfSlider.value + '%';
            this.els.comboLegValue.textContent = this.els.comboLegSlider.value + '%';
            cancelAnimationFrame(this._comboRAF);
            this._comboRAF = requestAnimationFrame(() => {
                this.applyCombined(...getComboParams());
            });
        };
        this.els.comboBodySlider.addEventListener('input', scheduleCombo);
        this.els.comboArmSlider.addEventListener('input', scheduleCombo);
        this.els.comboThighSlider.addEventListener('input', scheduleCombo);
        this.els.comboCalfSlider.addEventListener('input', scheduleCombo);
        this.els.comboLegSlider.addEventListener('input', scheduleCombo);

        this.els.comboCompareToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.compare-btn');
            if (!btn) return;
            this.els.comboCompareToggle.querySelectorAll('.compare-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.mode === 'before') {
                this.showOriginalOnCanvas(this.els.comboCanvas);
            } else {
                this.applyCombined(...getComboParams());
            }
        });

        this.els.btnSaveCombo.addEventListener('click', () => this.saveCanvasResult(this.els.comboCanvas, 'combined_slim_result.png'));
    }

    openAlbum() { this.els.fileInput.removeAttribute('capture'); this.els.fileInput.click(); }
    openCamera() { this.els.fileInput.setAttribute('capture', 'environment'); this.els.fileInput.click(); }

    setStatus(type, text) {
        this.els.statusDot.className = 'status-dot' + (type !== 'loading' ? ` ${type}` : '');
        this.els.statusText.textContent = text;
    }

    showOverlay(text, progress) {
        this.els.overlay.style.display = 'flex';
        this.els.overlayText.textContent = text;
        this.els.progressFill.style.width = (progress || 0) + '%';
    }

    hideOverlay() { this.els.overlay.style.display = 'none'; }

    // ==================== Model Loading ====================

    async loadModels() {
        this.setStatus('loading', '正在加载 TensorFlow.js...');
        const libs = [
            { global: 'tf',       local: 'lib/tf.min.js',       cdn: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js' },
            { global: 'bodyPix',  local: 'lib/body-pix.min.js', cdn: 'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.2.1/dist/body-pix.min.umd.min.js' },
        ];
        try {
            for (const lib of libs) {
                if (window[lib.global]) continue;
                this.setStatus('loading', `正在加载 ${lib.global}...`);
                try {
                    await this.loadScript(lib.local);
                    console.log(`Loaded local: ${lib.local}`);
                } catch (_) {
                    console.warn(`Local ${lib.local} failed, trying CDN: ${lib.cdn}`);
                    await this.loadScript(lib.cdn);
                    console.log(`Loaded CDN: ${lib.cdn}`);
                }
            }
            if (!window.bodyPix && window['body-pix']) window.bodyPix = window['body-pix'];
            if (!window.bodyPix && window.bodyPix_) window.bodyPix = window.bodyPix_;
        } catch (err) {
            console.error('Script load error:', err);
            this.setStatus('error', '脚本加载失败: ' + err.message);
            this.enableRetry();
            return;
        }

        try {
            tf.env().set('WEBGL_MAX_TEXTURE_SIZE', 4096);
            console.log('TF backend:', tf.getBackend(), 'WebGL max texture:', tf.env().get('WEBGL_MAX_TEXTURE_SIZE'));
        } catch(e) { console.warn('TF env set failed:', e); }

        if (typeof tf === 'undefined') {
            this.setStatus('error', 'TensorFlow.js 未加载成功');
            this.enableRetry();
            return;
        }
        if (typeof bodyPix === 'undefined') {
            this.setStatus('error', 'BodyPix 未加载成功');
            this.enableRetry();
            return;
        }

        try {
            this.setStatus('loading', '正在加载人体分割模型...');
            console.log('Loading BodyPix model from local...');
            this.bodyPixModel = await bodyPix.load({
                architecture: 'MobileNetV1', outputStride: 16,
                multiplier: 0.75, quantBytes: 2,
                modelUrl: 'models/bodypix/model.json',
            });
            console.log('BodyPix model loaded successfully');
            this.modelsReady = true;
            this.setStatus('ready', '模型已就绪，请上传包含全身人像的图片');
            this.syncDetectButton();
        } catch (err) {
            console.error('Model load error:', err);
            this.setStatus('error', '模型权重下载失败: ' + err.message);
            this.enableRetry();
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const s = document.createElement('script');
            s.src = src; s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load: ' + src));
            document.head.appendChild(s);
        });
    }

    enableRetry() {
        this.els.statusBar.style.cursor = 'pointer';
        this.els.statusText.textContent += '（点击此处重试）';
        const retry = () => {
            this.els.statusBar.style.cursor = '';
            this.els.statusBar.removeEventListener('click', retry);
            this.loadModels();
        };
        this.els.statusBar.addEventListener('click', retry);
    }

    syncDetectButton() {
        if (this.originalImage && this.els.previewCard.style.display !== 'none')
            this.els.btnDetect.disabled = false;
    }

    // ==================== File Handling ====================

    onFileSelected(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => { this.originalImage = img; this.showPreview(img); };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        this.els.fileInput.value = '';
    }

    showPreview(img) {
        const { w, h } = this.fitSize(img.width, img.height);
        const c = this.els.originalCanvas;
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        this.els.uploadCard.style.display = 'none';
        this.els.previewCard.style.display = '';
        this.els.resultsArea.style.display = 'none';
        if (this.modelsReady) { this.els.btnDetect.disabled = false; }
        else { this.els.btnDetect.disabled = true; this.waitForModels(); }
    }

    async waitForModels() {
        const btn = this.els.btnDetect;
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> 模型加载中...';
        while (!this.modelsReady) {
            await this.sleep(500);
            if (this.els.previewCard.style.display === 'none') return;
        }
        btn.innerHTML = origHtml;
        btn.disabled = false;
    }

    reset() {
        this.originalImage = null;
        this.cachedSrcPixels = null;
        this.cachedPartData = null;
        this.cachedBodyMask = null;
        this.cachedPose = null;
        this.faceCount = 0;
        this.multiPersonBlocked = false;
        this.els.uploadCard.style.display = '';
        this.els.previewCard.style.display = 'none';
        this.els.resultsArea.style.display = 'none';
    }

    fitSize(origW, origH) {
        const max = this.maxCanvasSize;
        let w = origW, h = origH;
        if (w > max) { h = h * max / w; w = max; }
        if (h > max) { w = w * max / h; h = max; }
        return { w: Math.round(w), h: Math.round(h) };
    }

    // ==================== Detection Pipeline ====================

    async runDetection() {
        if (!this.modelsReady || !this.originalImage) return;
        let step = '初始化';
        try {
            step = '准备画布';
            this.showOverlay('准备图片...', 5);
            const img = this.originalImage;
            const { w, h } = this.fitSize(img.width, img.height);
            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = w; srcCanvas.height = h;
            srcCanvas.getContext('2d').drawImage(img, 0, 0, w, h);

            step = '人脸检测';
            this.showOverlay('人脸检测中...', 10);
            await this.sleep(20);
            const faceResult = await this.detectFaces(srcCanvas);
            this.faceCount = faceResult.count;
            this.multiPersonBlocked = faceResult.count > 1;
            this.drawFaceDetection(srcCanvas, faceResult, w, h);

            step = 'BodyPix 推理';
            this.showOverlay('BodyPix 推理中（可能需要几秒）...', 25);
            await this.sleep(50);
            const segmentation = await this.bodyPixModel.segmentPersonParts(srcCanvas, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.5,
                scoreThreshold: 0.3,
            });

            step = '主人物过滤';
            this.showOverlay('识别主人物...', 40);
            await this.sleep(20);
            this.filterMainPerson(segmentation, w, h);

            step = '绘制关键点';
            this.showOverlay('绘制关键点定位...', 50);
            await this.sleep(20);
            this.drawPoseDetection(srcCanvas, segmentation, w, h);

            step = '绘制部位分割';
            this.showOverlay('绘制部位分割...', 60);
            await this.sleep(20);
            this.drawPartSegmentation(srcCanvas, segmentation, w, h);

            step = '生成瘦身权重';
            this.showOverlay('生成瘦身区域权重...', 72);
            await this.sleep(20);
            this.drawZoneWeights(srcCanvas, segmentation, w, h);

            step = '初始化瘦身引擎';
            this.showOverlay('初始化瘦身引擎...', 85);
            await this.sleep(20);
            this.els.resultsArea.style.display = '';
            this.updateSlimDisabledState();
            this.initSlimming(srcCanvas, segmentation, w, h);

            step = '初始化瘦腿引擎';
            this.showOverlay('初始化瘦腿引擎...', 90);
            await this.sleep(20);
            this.initLegSlimming();

            step = '初始化综合瘦身';
            this.showOverlay('初始化综合瘦身...', 96);
            await this.sleep(20);
            this.initCombined();

            this.hideOverlay();
            this.els.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Detection error at step [' + step + ']:', err);
            this.hideOverlay();
            alert('检测失败\n\n步骤: ' + step + '\n错误: ' + err.message + '\n\n' + (err.stack || '').substring(0, 300));
        }
    }

    // ==================== Step 1: Face Detection ====================

    async detectFaces(srcCanvas) {
        const hasCapacitor = typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.BodySlim;
        if (hasCapacitor) {
            try {
                const base64 = srcCanvas.toDataURL('image/jpeg', 0.8);
                const result = await Capacitor.Plugins.BodySlim.detectFaces({ image: base64 });
                return { count: result.count || 0, faces: result.faces || [] };
            } catch (e) {
                console.warn('Native face detection failed, skipping:', e);
                return { count: 0, faces: [] };
            }
        }
        console.log('Capacitor BodySlim plugin not available, skipping face detection');
        return { count: 0, faces: [] };
    }

    drawFaceDetection(srcCanvas, faceResult, w, h) {
        const canvas = this.els.faceCanvas;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(srcCanvas, 0, 0);

        const faces = faceResult.faces || [];
        const count = faceResult.count || 0;

        for (let i = 0; i < faces.length; i++) {
            const f = faces[i];
            const x = f.left * w;
            const y = f.top * h;
            const fw = (f.right - f.left) * w;
            const fh = (f.bottom - f.top) * h;

            const color = count > 1 ? '#ef4444' : '#10b981';

            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(x, y, fw, fh);
            ctx.setLineDash([]);

            const cornerLen = Math.min(16, fw * 0.15, fh * 0.15);
            ctx.lineWidth = 3;
            ctx.strokeStyle = color;
            this.drawCorners(ctx, x, y, fw, fh, cornerLen);

            ctx.font = 'bold 12px sans-serif';
            const label = `人脸 ${i + 1}`;
            const tw = ctx.measureText(label).width + 10;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x, y - 22, tw, 20, 4);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText(label, x + 5, y - 7);
        }

        let info = '';
        if (count === 0) {
            info = '<span class="tag tag-warning">提示</span> 未检测到人脸（原生插件不可用或未识别到人脸），继续执行后续步骤';
        } else if (count === 1) {
            info = '<span class="tag tag-success">通过</span> 检测到 1 张人脸，所有功能可用';
        } else {
            info = `<span class="tag tag-danger">多人</span> 检测到 ${count} 张人脸，<strong>瘦身和瘦腿功能已禁用</strong>（仅支持单人模式）`;
        }
        this.els.faceInfo.innerHTML = info;
    }

    updateSlimDisabledState() {
        const blocked = this.multiPersonBlocked;
        const cards = [this.els.slimCard, this.els.legSlimCard, this.els.comboCard];
        const sliders = [
            this.els.slimSlider, this.els.thighSlider, this.els.calfSlider,
            this.els.comboBodySlider, this.els.comboArmSlider, this.els.comboThighSlider,
            this.els.comboCalfSlider, this.els.comboLegSlider,
        ];
        const buttons = [this.els.btnSave, this.els.btnSaveLeg, this.els.btnSaveCombo];

        if (blocked) {
            for (const card of cards) {
                card.classList.add('disabled-overlay');
                if (!card.querySelector('.disabled-banner')) {
                    const banner = document.createElement('div');
                    banner.className = 'disabled-banner';
                    banner.textContent = '检测到多人，该功能已禁用（仅支持单人模式）';
                    card.insertBefore(banner, card.querySelector('.slim-controls'));
                }
            }
            for (const s of sliders) s.disabled = true;
            for (const b of buttons) b.disabled = true;
        } else {
            for (const card of cards) {
                card.classList.remove('disabled-overlay');
                const b = card.querySelector('.disabled-banner');
                if (b) b.remove();
            }
            for (const s of sliders) s.disabled = false;
            for (const b of buttons) b.disabled = false;
        }
    }

    filterMainPerson(seg, w, h) {
        const poses = seg.allPoses || [];
        if (poses.length < 2) return;

        const mainPose = poses[0];
        const kps = mainPose.keypoints;

        let minX = w, maxX = 0, minY = h, maxY = 0;
        let validCount = 0;
        for (const kp of kps) {
            if (kp.score > 0.3) {
                minX = Math.min(minX, kp.position.x);
                maxX = Math.max(maxX, kp.position.x);
                minY = Math.min(minY, kp.position.y);
                maxY = Math.max(maxY, kp.position.y);
                validCount++;
            }
        }

        if (validCount < 3) return;

        const bodyW = maxX - minX;
        const bodyH = maxY - minY;
        const padX = bodyW * 0.15;
        const padY = bodyH * 0.10;
        const roiL = Math.max(0, Math.floor(minX - padX));
        const roiR = Math.min(w - 1, Math.ceil(maxX + padX));
        const roiT = Math.max(0, Math.floor(minY - padY));
        const roiB = Math.min(h - 1, Math.ceil(maxY + padY));

        const data = seg.data;
        let removed = 0;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = y * w + x;
                if (data[i] < 0) continue;
                if (x < roiL || x > roiR || y < roiT || y > roiB) {
                    data[i] = -1;
                    removed++;
                }
            }
        }

        console.log(`filterMainPerson: ROI [${roiL},${roiT}]-[${roiR},${roiB}], removed ${removed} pixels from other persons`);
    }

    // ==================== Step 1: Pose Detection ====================

    drawPoseDetection(srcCanvas, seg, w, h) {
        const canvas = this.els.poseCanvas;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(srcCanvas, 0, 0);

        const poses = seg.allPoses || [];
        if (poses.length === 0) {
            this.els.poseInfo.innerHTML = '<span class="tag tag-danger">提示</span> 未检测到人体姿态，请尝试更清晰的全身人像';
            return;
        }

        const pose = poses[0];
        const kps = pose.keypoints;

        // Draw bounding box from keypoints
        let minX = w, maxX = 0, minY = h, maxY = 0;
        let validCount = 0;
        for (const kp of kps) {
            if (kp.score > 0.3) {
                minX = Math.min(minX, kp.position.x);
                maxX = Math.max(maxX, kp.position.x);
                minY = Math.min(minY, kp.position.y);
                maxY = Math.max(maxY, kp.position.y);
                validCount++;
            }
        }

        if (validCount > 0) {
            const pad = 20;
            const bx = Math.max(0, minX - pad), by = Math.max(0, minY - pad);
            const bw = Math.min(w, maxX + pad) - bx, bh = Math.min(h, maxY + pad) - by;
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 5]);
            ctx.strokeRect(bx, by, bw, bh);
            ctx.setLineDash([]);

            const cornerLen = Math.min(20, bw * 0.1, bh * 0.1);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ec4899';
            this.drawCorners(ctx, bx, by, bw, bh, cornerLen);
        }

        // Draw skeleton
        ctx.lineWidth = 3;
        for (const [i, j] of SKELETON) {
            const a = kps[i], b = kps[j];
            if (a.score > 0.3 && b.score > 0.3) {
                ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
                ctx.beginPath();
                ctx.moveTo(a.position.x, a.position.y);
                ctx.lineTo(b.position.x, b.position.y);
                ctx.stroke();
            }
        }

        // Draw keypoints
        const kpColors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
            '#ec4899', '#f43f5e',
        ];
        for (let i = 0; i < kps.length; i++) {
            const kp = kps[i];
            if (kp.score < 0.2) continue;
            const alpha = Math.min(1, kp.score + 0.2);
            const color = kpColors[i];

            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(kp.position.x, kp.position.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.font = 'bold 11px sans-serif';
            const label = `${KP_NAMES[i]}`;
            const tw = ctx.measureText(label).width + 8;
            const lx = kp.position.x + 10;
            const ly = kp.position.y - 8;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            ctx.roundRect(lx - 2, ly - 11, tw, 16, 4);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText(label, lx + 2, ly + 2);
            ctx.globalAlpha = 1;
        }

        // Info
        let info = `<span class="tag tag-info">姿态检测</span> 检测到 ${poses.length} 个人体姿态`;
        if (poses.length > 1) {
            info += ` · <span class="tag tag-warning">已锁定主人物，其余 ${poses.length - 1} 人已过滤</span>`;
        }
        info += '<br>';
        const highConf = kps.filter(k => k.score > 0.5).length;
        const medConf = kps.filter(k => k.score > 0.3 && k.score <= 0.5).length;
        const lowConf = kps.filter(k => k.score <= 0.3).length;
        info += `<span class="tag tag-success">关键点</span> 高置信 ${highConf} 个 · 中置信 ${medConf} 个 · 低置信 ${lowConf} 个<br>`;

        const kpDetails = kps.map((kp, i) => {
            const conf = (kp.score * 100).toFixed(0);
            const icon = kp.score > 0.5 ? '●' : kp.score > 0.3 ? '◐' : '○';
            return `${icon} ${KP_NAMES[i]}(${conf}%) [${Math.round(kp.position.x)},${Math.round(kp.position.y)}]`;
        }).join(' · ');
        info += `<span class="tag tag-warning">详情</span> ${kpDetails}`;
        this.els.poseInfo.innerHTML = info;
    }

    drawCorners(ctx, x, y, w, h, len) {
        ctx.beginPath();
        ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
        ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
        ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
        ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
        ctx.stroke();
    }

    // ==================== Step 2: Part Segmentation ====================

    drawPartSegmentation(srcCanvas, seg, w, h) {
        const canvas = this.els.partCanvas;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(srcCanvas, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const partData = seg.data;
        const n = w * h;

        const partPixelCounts = new Int32Array(24);

        for (let i = 0; i < n; i++) {
            const pi = i << 2;
            const part = partData[i];
            if (part >= 0 && part < 24) {
                partPixelCounts[part]++;
                const [cr, cg, cb] = PART_COLORS[part];
                d[pi]     = (d[pi]     * 128 + cr * 128) >> 8;
                d[pi + 1] = (d[pi + 1] * 128 + cg * 128) >> 8;
                d[pi + 2] = (d[pi + 2] * 128 + cb * 128) >> 8;
            } else {
                d[pi]     = (d[pi] * 77) >> 8;
                d[pi + 1] = (d[pi + 1] * 77) >> 8;
                d[pi + 2] = (d[pi + 2] * 77) >> 8;
            }
        }

        // Draw contours between different parts
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = y * w + x;
                const p = partData[idx];
                if (p < 0) continue;
                const up = partData[idx - w], dn = partData[idx + w];
                const lt = partData[idx - 1], rt = partData[idx + 1];
                if (up !== p || dn !== p || lt !== p || rt !== p) {
                    const pi = idx << 2;
                    const [cr, cg, cb] = PART_COLORS[p];
                    d[pi] = cr; d[pi + 1] = cg; d[pi + 2] = cb; d[pi + 3] = 255;
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // Info
        let info = '<span class="tag tag-info">部位分割</span> 24 个身体部位的像素级分割<br>';
        const totalBody = partPixelCounts.reduce((a, b) => a + b, 0);
        info += `<span class="tag tag-success">人体总像素</span> ${totalBody.toLocaleString()} 个，占画面 ${(totalBody / n * 100).toFixed(1)}%<br>`;

        const groupInfo = Object.entries(PART_GROUPS).map(([name, indices]) => {
            const count = indices.reduce((s, i) => s + partPixelCounts[i], 0);
            if (count === 0) return null;
            const pct = (count / Math.max(1, totalBody) * 100).toFixed(1);
            return `${name}(${pct}%)`;
        }).filter(Boolean).join(' · ');
        info += `<span class="tag tag-warning">部位占比</span> ${groupInfo}`;
        this.els.partInfo.innerHTML = info;
    }

    // ==================== Step 3: Zone Weights Visualization ====================

    drawZoneWeights(srcCanvas, seg, w, h) {
        const canvas = this.els.zoneCanvas;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(srcCanvas, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const partData = seg.data;
        const n = w * h;
        const poses = seg.allPoses || [];
        const pose = poses.length > 0 ? poses[0] : null;
        const zoneFactorsPerRow = this.getZoneFactors(pose, partData, w, h);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = y * w + x;
                const pi = i << 2;
                const part = partData[i];
                if (part < 0) {
                    d[pi] = (d[pi] * 64) >> 8;
                    d[pi + 1] = (d[pi + 1] * 64) >> 8;
                    d[pi + 2] = (d[pi + 2] * 64) >> 8;
                    continue;
                }

                const factor = zoneFactorsPerRow[y];
                // Heatmap: blue(0) -> green(0.5) -> red(1.0)
                let hr, hg, hb;
                if (factor < 0.5) {
                    const t = factor * 2;
                    hr = 0; hg = Math.round(200 * t); hb = Math.round(220 * (1 - t));
                } else {
                    const t = (factor - 0.5) * 2;
                    hr = Math.round(240 * t); hg = Math.round(200 * (1 - t)); hb = 0;
                }

                d[pi]     = (d[pi] * 140 + hr * 116) >> 8;
                d[pi + 1] = (d[pi + 1] * 140 + hg * 116) >> 8;
                d[pi + 2] = (d[pi + 2] * 140 + hb * 116) >> 8;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // Draw legend
        const legendW = 20, legendH = Math.min(200, h * 0.6);
        const lx = w - legendW - 12, ly = (h - legendH) / 2;
        for (let i = 0; i < legendH; i++) {
            const f = 1 - i / legendH;
            let cr, cg, cb;
            if (f < 0.5) {
                const t = f * 2;
                cr = 0; cg = Math.round(200 * t); cb = Math.round(220 * (1 - t));
            } else {
                const t = (f - 0.5) * 2;
                cr = Math.round(240 * t); cg = Math.round(200 * (1 - t)); cb = 0;
            }
            ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
            ctx.fillRect(lx, ly + i, legendW, 1);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(lx, ly, legendW, legendH);

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 3;
        ctx.fillText('强', lx - 2, ly - 4);
        ctx.fillText('弱', lx - 2, ly + legendH + 14);
        ctx.shadowBlur = 0;

        let info = '<span class="tag tag-info">热力图</span> 颜色越红表示该区域瘦身强度越大<br>';
        info += '<span class="tag tag-danger">强瘦身</span> 腰部/躯干区域 · ';
        info += '<span class="tag tag-warning">中等</span> 大腿/上臂 · ';
        info += '<span class="tag tag-success">轻微</span> 小腿/前臂<br>';
        info += '<span class="tag tag-info">策略</span> 基于关键点 Y 坐标划分腰/臀/腿区域，自动计算逐行权重';
        this.els.zoneInfo.innerHTML = info;
    }

    // ==================== Step 5: Body Slimming ====================

    initSlimming(srcCanvas, seg, w, h) {
        this.cachedW = w;
        this.cachedH = h;
        this.cachedPartData = seg.data;

        const n = w * h;
        this.cachedBodyMask = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
            if (seg.data[i] >= 0) this.cachedBodyMask[i] = 1;
        }

        this.cachedPose = (seg.allPoses && seg.allPoses.length > 0) ? seg.allPoses[0] : null;

        const ctx = srcCanvas.getContext('2d', { willReadFrequently: true });
        this.cachedSrcPixels = ctx.getImageData(0, 0, w, h).data.slice();

        this.els.slimSlider.value = 30;
        this.els.slimValue.textContent = '30%';
        const btns = this.els.compareToggle.querySelectorAll('.compare-btn');
        btns.forEach(b => b.classList.remove('active'));
        btns[0].classList.add('active');

        if (this.multiPersonBlocked) {
            this.showOriginalOnSlimCanvas();
            this.els.slimInfo.innerHTML = '<span class="tag tag-danger">禁用</span> 检测到多人，瘦身功能不可用';
        } else {
            this.applySlimming(30);
        }
    }

    applySlimming(intensity) {
        if (this.multiPersonBlocked) return;
        const { cachedSrcPixels: src, cachedW: w, cachedH: h } = this;
        if (!src) return;

        const t = intensity / 100;
        if (t < 0.01) {
            this.showOriginalOnSlimCanvas();
            this.els.slimInfo.innerHTML = '<span class="tag tag-info">提示</span> 瘦身强度为 0，显示原图';
            return;
        }

        const displace = this.buildBodyDisplacement(t, false);
        this.renderDisplacement(displace, this.els.slimCanvas);

        const maxSlimRatio = 0.28;
        const actualMax = (t * maxSlimRatio * 100).toFixed(1);
        this.els.slimInfo.innerHTML =
            `<span class="tag tag-info">强度</span> ${intensity}% → 最大体宽缩减 ${actualMax}%<br>` +
            `<span class="tag tag-success">算法</span> 逐行扫描线 · 分段线性映射 · 6px 垂直平滑<br>` +
            `<span class="tag tag-warning">分区</span> 腰部×1.0 · 躯干×0.9 · 大腿×0.7 · 上臂×0.5 · 小腿×0.4`;
    }

    // ==================== Displacement Field Builders ====================

    buildBodyDisplacement(t, excludeLegs) {
        const { cachedBodyMask: bodyMask, cachedPose: pose,
                cachedPartData: partData, cachedW: w, cachedH: h } = this;
        if (!bodyMask) return new Float32Array(w * h);

        const n = w * h;
        const maxSlimRatio = 0.28;
        const zoneFactors = this.getZoneFactors(pose, partData, w, h, excludeLegs);
        const { leftBounds, rightBounds, centers } = this.buildBodyBoundaries(bodyMask, w, h);
        const displace = new Float32Array(n);

        for (let y = 0; y < h; y++) {
            const lb = leftBounds[y];
            const rb = rightBounds[y];
            if (lb < 0 || rb - lb < 10) continue;

            const cx = centers[y];
            const hw = (rb - lb) * 0.5;
            const slimRatio = t * maxSlimRatio * zoneFactors[y];
            if (slimRatio < 0.001) continue;

            const newHW = hw * (1 - slimRatio);
            const scale = hw / newHW;
            const newLb = cx - newHW;
            const newRb = cx + newHW;

            for (let x = 0; x < w; x++) {
                let srcX;
                if (x >= newLb && x <= newRb) {
                    srcX = cx + (x - cx) * scale;
                } else if (x < newLb) {
                    const outRange = newLb;
                    const srcRange = lb;
                    srcX = outRange > 0.5 ? x * srcRange / outRange : x;
                } else {
                    const outRange = w - 1 - newRb;
                    const srcRange = w - 1 - rb;
                    srcX = (outRange > 0.5)
                        ? rb + (x - newRb) * srcRange / outRange
                        : x;
                }
                displace[y * w + x] = srcX - x;
            }
        }

        this.smoothDisplacement(displace, w, h, 6);
        return displace;
    }

    buildLegDisplacement(tThigh, tCalf) {
        const { cachedPartData: partData, cachedW: w, cachedH: h } = this;
        if (!partData) return new Float32Array(w * h);

        const maxRatio = 0.30;
        const n = w * h;

        const isLeftThigh  = (p) => p === 14 || p === 15;
        const isRightThigh = (p) => p === 16 || p === 17;
        const isLeftCalf   = (p) => p === 18 || p === 19;
        const isRightCalf  = (p) => p === 20 || p === 21;

        const buildLegBounds = (partTest) => {
            const rawL = new Float32Array(h).fill(-1);
            const rawR = new Float32Array(h).fill(-1);
            for (let y = 0; y < h; y++) {
                const row = y * w;
                for (let x = 0; x < w; x++) {
                    if (partTest(partData[row + x])) {
                        if (rawL[y] < 0) rawL[y] = x;
                        rawR[y] = x;
                    }
                }
            }
            const sr = 6;
            const left = new Float32Array(h).fill(-1);
            const right = new Float32Array(h).fill(-1);
            const center = new Float32Array(h);
            for (let y = 0; y < h; y++) {
                if (rawL[y] < 0) continue;
                let sL = 0, sR = 0, c = 0;
                for (let dy = -sr; dy <= sr; dy++) {
                    const ny = y + dy;
                    if (ny >= 0 && ny < h && rawL[ny] >= 0) {
                        sL += rawL[ny]; sR += rawR[ny]; c++;
                    }
                }
                if (c > 0) { left[y] = sL / c; right[y] = sR / c; center[y] = (left[y] + right[y]) * 0.5; }
            }
            return { left, right, center };
        };

        const legs = [
            { bounds: buildLegBounds(isLeftThigh),  ratio: tThigh * maxRatio },
            { bounds: buildLegBounds(isRightThigh), ratio: tThigh * maxRatio },
            { bounds: buildLegBounds(isLeftCalf),   ratio: tCalf  * maxRatio },
            { bounds: buildLegBounds(isRightCalf),  ratio: tCalf  * maxRatio },
        ];

        const displace = new Float32Array(n);

        for (const leg of legs) {
            const { left: lb, right: rb, center: cx } = leg.bounds;
            const slimRatio = leg.ratio;
            if (slimRatio < 0.001) continue;

            for (let y = 0; y < h; y++) {
                if (lb[y] < 0 || rb[y] - lb[y] < 4) continue;
                const hw = (rb[y] - lb[y]) * 0.5;
                const newHW = hw * (1 - slimRatio);
                const scale = hw / newHW;
                const c = cx[y];
                const newL = c - newHW;
                const newR = c + newHW;

                for (let x = Math.max(0, Math.floor(lb[y] - hw)); x <= Math.min(w - 1, Math.ceil(rb[y] + hw)); x++) {
                    let srcX;
                    if (x >= newL && x <= newR) {
                        srcX = c + (x - c) * scale;
                    } else if (x < newL) {
                        srcX = lb[y] - (newL - x) * (lb[y] < 1 ? 1 : (lb[y] / newL));
                    } else {
                        srcX = rb[y] + (x - newR) * ((w - 1 - rb[y]) / Math.max(1, w - 1 - newR));
                    }
                    const d = srcX - x;
                    if (Math.abs(d) > Math.abs(displace[y * w + x])) {
                        displace[y * w + x] = d;
                    }
                }
            }
        }

        this.smoothDisplacement(displace, w, h, 5);
        return displace;
    }

    buildArmDisplacement(tArm) {
        const { cachedPartData: partData, cachedW: w, cachedH: h } = this;
        if (!partData) return new Float32Array(w * h);

        const maxRatio = 0.25;
        const n = w * h;

        const isLeftUpperArm  = (p) => p === 2 || p === 3;
        const isRightUpperArm = (p) => p === 4 || p === 5;
        const isLeftForearm   = (p) => p === 6 || p === 7;
        const isRightForearm  = (p) => p === 8 || p === 9;

        const buildArmBounds = (partTest) => {
            const rawL = new Float32Array(h).fill(-1);
            const rawR = new Float32Array(h).fill(-1);
            for (let y = 0; y < h; y++) {
                const row = y * w;
                for (let x = 0; x < w; x++) {
                    if (partTest(partData[row + x])) {
                        if (rawL[y] < 0) rawL[y] = x;
                        rawR[y] = x;
                    }
                }
            }
            const sr = 4;
            const left = new Float32Array(h).fill(-1);
            const right = new Float32Array(h).fill(-1);
            const center = new Float32Array(h);
            for (let y = 0; y < h; y++) {
                if (rawL[y] < 0) continue;
                let sL = 0, sR = 0, c = 0;
                for (let dy = -sr; dy <= sr; dy++) {
                    const ny = y + dy;
                    if (ny >= 0 && ny < h && rawL[ny] >= 0) {
                        sL += rawL[ny]; sR += rawR[ny]; c++;
                    }
                }
                if (c > 0) { left[y] = sL / c; right[y] = sR / c; center[y] = (left[y] + right[y]) * 0.5; }
            }
            return { left, right, center };
        };

        const arms = [
            { bounds: buildArmBounds(isLeftUpperArm),  ratio: tArm * maxRatio },
            { bounds: buildArmBounds(isRightUpperArm), ratio: tArm * maxRatio },
            { bounds: buildArmBounds(isLeftForearm),   ratio: tArm * maxRatio * 0.7 },
            { bounds: buildArmBounds(isRightForearm),  ratio: tArm * maxRatio * 0.7 },
        ];

        const displace = new Float32Array(n);

        for (const arm of arms) {
            const { left: lb, right: rb, center: cx } = arm.bounds;
            const slimRatio = arm.ratio;
            if (slimRatio < 0.001) continue;

            for (let y = 0; y < h; y++) {
                if (lb[y] < 0 || rb[y] - lb[y] < 3) continue;
                const hw = (rb[y] - lb[y]) * 0.5;
                const newHW = hw * (1 - slimRatio);
                const scale = hw / newHW;
                const c = cx[y];
                const newL = c - newHW;
                const newR = c + newHW;

                for (let x = Math.max(0, Math.floor(lb[y] - hw)); x <= Math.min(w - 1, Math.ceil(rb[y] + hw)); x++) {
                    let srcX;
                    if (x >= newL && x <= newR) {
                        srcX = c + (x - c) * scale;
                    } else if (x < newL) {
                        srcX = lb[y] - (newL - x) * (lb[y] < 1 ? 1 : (lb[y] / newL));
                    } else {
                        srcX = rb[y] + (x - newR) * ((w - 1 - rb[y]) / Math.max(1, w - 1 - newR));
                    }
                    const d = srcX - x;
                    if (Math.abs(d) > Math.abs(displace[y * w + x])) {
                        displace[y * w + x] = d;
                    }
                }
            }
        }

        this.smoothDisplacement(displace, w, h, 4);
        return displace;
    }

    renderDisplacement(displaceX, canvas, displaceY) {
        const { cachedSrcPixels: src, cachedW: w, cachedH: h } = this;
        if (!src) return;

        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(w, h);
        const out = imgData.data;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;
                const srcX = x + displaceX[idx];
                const srcY = displaceY ? y + displaceY[idx] : y;
                const pi = idx << 2;

                const x0 = Math.floor(srcX), x1 = x0 + 1, fx = srcX - x0;
                const y0 = Math.floor(srcY), y1 = y0 + 1, fy = srcY - y0;
                const cx0 = Math.max(0, Math.min(w - 1, x0));
                const cx1 = Math.max(0, Math.min(w - 1, x1));
                const cy0 = Math.max(0, Math.min(h - 1, y0));
                const cy1 = Math.max(0, Math.min(h - 1, y1));

                const i00 = (cy0 * w + cx0) << 2;
                const i10 = (cy0 * w + cx1) << 2;
                const i01 = (cy1 * w + cx0) << 2;
                const i11 = (cy1 * w + cx1) << 2;

                const wx0 = 1 - fx, wx1 = fx;
                const wy0 = 1 - fy, wy1 = fy;

                for (let c = 0; c < 4; c++) {
                    out[pi + c] = (
                        src[i00 + c] * wx0 * wy0 +
                        src[i10 + c] * wx1 * wy0 +
                        src[i01 + c] * wx0 * wy1 +
                        src[i11 + c] * wx1 * wy1 + 0.5
                    ) | 0;
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    buildLongLegRemap(tLeg) {
        const { cachedPose: pose, cachedW: w, cachedH: h } = this;
        const n = w * h;
        const displaceY = new Float32Array(n);
        if (tLeg < 0.01) return displaceY;

        let hipY, kneeY, ankleY;
        if (pose && pose.keypoints && pose.keypoints.length >= 17) {
            const kps = pose.keypoints;
            const getY = (idx) => kps[idx].score > 0.3 ? kps[idx].position.y : -1;
            const lhY = getY(11), rhY = getY(12);
            if (lhY >= 0 && rhY >= 0) hipY = (lhY + rhY) / 2;
            else if (lhY >= 0) hipY = lhY;
            else if (rhY >= 0) hipY = rhY;

            const lkY = getY(13), rkY = getY(14);
            if (lkY >= 0 && rkY >= 0) kneeY = (lkY + rkY) / 2;
            else if (lkY >= 0) kneeY = lkY;
            else if (rkY >= 0) kneeY = rkY;

            const laY = getY(15), raY = getY(16);
            if (laY >= 0 && raY >= 0) ankleY = (laY + raY) / 2;
            else if (laY >= 0) ankleY = laY;
            else if (raY >= 0) ankleY = raY;
        }

        const hasKnee = kneeY != null && kneeY > 0;
        const hasAnkle = ankleY != null && ankleY > 0;
        if (!hasKnee && !hasAnkle) return displaceY;

        if (hipY == null && hasKnee) {
            const calfLen = hasAnkle ? (ankleY - kneeY) : (h * 0.15);
            hipY = kneeY - calfLen * 1.2;
        }
        if (ankleY == null && hasKnee) {
            ankleY = kneeY + (kneeY - hipY) * 0.6;
        }
        hipY = Math.max(0, hipY);
        ankleY = Math.min(h - 1, ankleY);
        if (ankleY <= hipY) return displaceY;

        const maxStretch = 0.08;
        const stretch = tLeg * maxStretch;
        const legLen = ankleY - hipY;
        const stretchPx = stretch * legLen;

        const srcYmap = new Float32Array(h);
        for (let y = 0; y < h; y++) {
            if (y <= hipY) {
                const ratio = hipY > 0 ? y / hipY : 0;
                srcYmap[y] = ratio * (hipY + stretchPx * 0.15);
            } else if (y <= ankleY) {
                const t = (y - hipY) / (ankleY - hipY);
                const srcStart = hipY + stretchPx * 0.15;
                const srcEnd = ankleY - stretchPx * 0.85;
                srcYmap[y] = srcStart + t * (srcEnd - srcStart);
            } else {
                const t = (y - ankleY) / Math.max(1, h - 1 - ankleY);
                const srcStart = ankleY - stretchPx * 0.85;
                srcYmap[y] = srcStart + t * (h - 1 - srcStart);
            }
        }

        for (let y = 0; y < h; y++) {
            const dy = srcYmap[y] - y;
            for (let x = 0; x < w; x++) {
                displaceY[y * w + x] = dy;
            }
        }

        return displaceY;
    }

    // ==================== Slimming Helpers ====================

    buildBodyBoundaries(bodyMask, w, h) {
        const rawLeft = new Float32Array(h).fill(-1);
        const rawRight = new Float32Array(h).fill(-1);

        for (let y = 0; y < h; y++) {
            const row = y * w;
            for (let x = 0; x < w; x++) {
                if (bodyMask[row + x]) {
                    if (rawLeft[y] < 0) rawLeft[y] = x;
                    rawRight[y] = x;
                }
            }
        }

        const smoothRadius = 10;
        const leftBounds = new Float32Array(h).fill(-1);
        const rightBounds = new Float32Array(h).fill(-1);
        const centers = new Float32Array(h);

        for (let y = 0; y < h; y++) {
            if (rawLeft[y] < 0) continue;
            let sumL = 0, sumR = 0, count = 0;
            for (let dy = -smoothRadius; dy <= smoothRadius; dy++) {
                const ny = y + dy;
                if (ny >= 0 && ny < h && rawLeft[ny] >= 0) {
                    sumL += rawLeft[ny];
                    sumR += rawRight[ny];
                    count++;
                }
            }
            if (count > 0) {
                leftBounds[y] = sumL / count;
                rightBounds[y] = sumR / count;
                centers[y] = (leftBounds[y] + rightBounds[y]) * 0.5;
            }
        }

        return { leftBounds, rightBounds, centers };
    }

    getZoneFactors(pose, partData, w, h, excludeLegs) {
        const factors = new Float32Array(h);

        if (!pose || !pose.keypoints || pose.keypoints.length < 17) {
            factors.fill(excludeLegs ? 0 : 0.7);
            return this.smoothFactors(factors, h);
        }

        const kps = pose.keypoints;
        const getY = (idx) => kps[idx].score > 0.3 ? kps[idx].position.y : -1;

        let shoulderY = -1, hipY = -1, kneeY = -1, ankleY = -1;

        const lsY = getY(5), rsY = getY(6);
        if (lsY >= 0 && rsY >= 0) shoulderY = (lsY + rsY) / 2;
        else if (lsY >= 0) shoulderY = lsY;
        else if (rsY >= 0) shoulderY = rsY;

        const lhY = getY(11), rhY = getY(12);
        if (lhY >= 0 && rhY >= 0) hipY = (lhY + rhY) / 2;
        else if (lhY >= 0) hipY = lhY;
        else if (rhY >= 0) hipY = rhY;

        const lkY = getY(13), rkY = getY(14);
        if (lkY >= 0 && rkY >= 0) kneeY = (lkY + rkY) / 2;
        else if (lkY >= 0) kneeY = lkY;
        else if (rkY >= 0) kneeY = rkY;

        const laY = getY(15), raY = getY(16);
        if (laY >= 0 && raY >= 0) ankleY = (laY + raY) / 2;
        else if (laY >= 0) ankleY = laY;
        else if (raY >= 0) ankleY = raY;

        for (let y = 0; y < h; y++) {
            let f = 0;

            if (shoulderY >= 0 && y < shoulderY) {
                f = 0.05;
            } else if (shoulderY >= 0 && hipY >= 0 && y >= shoulderY && y <= hipY) {
                const torsoT = (y - shoulderY) / (hipY - shoulderY);
                if (torsoT < 0.2) {
                    f = 0.4 + torsoT * 3.0;
                } else if (torsoT < 0.6) {
                    f = 1.0;
                } else {
                    f = 1.0 - (torsoT - 0.6) * 0.5;
                }
            } else if (hipY >= 0 && kneeY >= 0 && y > hipY && y <= kneeY) {
                f = excludeLegs ? 0 : (0.75 - ((y - hipY) / (kneeY - hipY)) * 0.15);
            } else if (kneeY >= 0 && ankleY >= 0 && y > kneeY && y <= ankleY) {
                f = excludeLegs ? 0 : 0.4;
            } else if (ankleY >= 0 && y > ankleY) {
                f = excludeLegs ? 0 : 0.1;
            } else {
                f = 0.6;
            }

            factors[y] = f;
        }

        return this.smoothFactors(factors, h);
    }

    smoothFactors(factors, h) {
        const smoothed = new Float32Array(h);
        const sr = 12;
        for (let y = 0; y < h; y++) {
            let sum = 0, count = 0;
            const from = Math.max(0, y - sr), to = Math.min(h - 1, y + sr);
            for (let ny = from; ny <= to; ny++) {
                sum += factors[ny];
                count++;
            }
            smoothed[y] = sum / count;
        }
        return smoothed;
    }

    smoothDisplacement(displace, w, h, radius) {
        const temp = new Float32Array(w * h);
        for (let x = 0; x < w; x++) {
            let sum = 0, count = 0;
            for (let y = 0; y <= Math.min(radius, h - 1); y++) {
                sum += displace[y * w + x];
                count++;
            }
            for (let y = 0; y < h; y++) {
                temp[y * w + x] = sum / count;
                const addY = y + radius + 1;
                const remY = y - radius;
                if (addY < h) { sum += displace[addY * w + x]; count++; }
                if (remY >= 0) { sum -= displace[remY * w + x]; count--; }
            }
        }
        displace.set(temp);
    }

    showOriginalOnSlimCanvas() {
        this.showOriginalOnCanvas(this.els.slimCanvas);
    }

    showOriginalOnCanvas(canvas) {
        const { cachedSrcPixels: src, cachedW: w, cachedH: h } = this;
        if (!src) return;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(w, h);
        imgData.data.set(src);
        ctx.putImageData(imgData, 0, 0);
    }

    saveResult() {
        this.saveCanvasResult(this.els.slimCanvas, 'body_slim_result.png');
    }

    saveCanvasResult(canvas, filename) {
        if (!canvas.width) return;
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // ==================== Step 5: Leg Slimming ====================

    initLegSlimming() {
        this.els.thighSlider.value = 40;
        this.els.thighValue.textContent = '40%';
        this.els.calfSlider.value = 30;
        this.els.calfValue.textContent = '30%';
        const btns = this.els.legCompareToggle.querySelectorAll('.compare-btn');
        btns.forEach(b => b.classList.remove('active'));
        btns[0].classList.add('active');

        if (this.multiPersonBlocked) {
            this.showOriginalOnCanvas(this.els.legSlimCanvas);
            this.els.legSlimInfo.innerHTML = '<span class="tag tag-danger">禁用</span> 检测到多人，瘦腿功能不可用';
        } else {
            this.applyLegSlimming(40, 30);
        }
    }

    applyLegSlimming(thighIntensity, calfIntensity) {
        if (this.multiPersonBlocked) return;
        const { cachedSrcPixels: src, cachedPartData: partData } = this;
        if (!src || !partData) return;

        const tThigh = thighIntensity / 100;
        const tCalf = calfIntensity / 100;
        if (tThigh < 0.01 && tCalf < 0.01) {
            this.showOriginalOnCanvas(this.els.legSlimCanvas);
            this.els.legSlimInfo.innerHTML = '<span class="tag tag-info">提示</span> 瘦腿强度为 0，显示原图';
            return;
        }

        const displace = this.buildLegDisplacement(tThigh, tCalf);
        this.renderDisplacement(displace, this.els.legSlimCanvas);

        const maxRatio = 0.30;
        const activeLegs = [];
        if (tThigh > 0.01) activeLegs.push(`大腿 ${thighIntensity}%→缩减${(tThigh * maxRatio * 100).toFixed(1)}%`);
        if (tCalf > 0.01) activeLegs.push(`小腿 ${calfIntensity}%→缩减${(tCalf * maxRatio * 100).toFixed(1)}%`);
        this.els.legSlimInfo.innerHTML =
            `<span class="tag tag-info">模式</span> 部位分割精准瘦腿 · 左右腿独立处理<br>` +
            `<span class="tag tag-success">强度</span> ${activeLegs.join(' · ')}<br>` +
            `<span class="tag tag-warning">区域</span> 仅影响腿部像素，其他部位完全不变`;
    }

    // ==================== Step 7: Combined Slimming ====================

    initCombined() {
        this.els.comboBodySlider.value = 30;
        this.els.comboBodyValue.textContent = '30%';
        this.els.comboArmSlider.value = 30;
        this.els.comboArmValue.textContent = '30%';
        this.els.comboThighSlider.value = 40;
        this.els.comboThighValue.textContent = '40%';
        this.els.comboCalfSlider.value = 30;
        this.els.comboCalfValue.textContent = '30%';
        this.els.comboLegSlider.value = 30;
        this.els.comboLegValue.textContent = '30%';
        const btns = this.els.comboCompareToggle.querySelectorAll('.compare-btn');
        btns.forEach(b => b.classList.remove('active'));
        btns[0].classList.add('active');

        if (this.multiPersonBlocked) {
            this.showOriginalOnCanvas(this.els.comboCanvas);
            this.els.comboInfo.innerHTML = '<span class="tag tag-danger">禁用</span> 检测到多人，综合瘦身功能不可用';
        } else {
            this.applyCombined(30, 30, 40, 30, 30);
        }
    }

    applyCombined(bodyIntensity, armIntensity, thighIntensity, calfIntensity, longLegIntensity) {
        if (this.multiPersonBlocked) return;
        const { cachedSrcPixels: src, cachedW: w, cachedH: h } = this;
        if (!src) return;

        const tBody = bodyIntensity / 100;
        const tArm = (armIntensity || 0) / 100;
        const tThigh = thighIntensity / 100;
        const tCalf = calfIntensity / 100;
        const tLeg = (longLegIntensity || 0) / 100;

        if (tBody < 0.01 && tArm < 0.01 && tThigh < 0.01 && tCalf < 0.01 && tLeg < 0.01) {
            this.showOriginalOnCanvas(this.els.comboCanvas);
            this.els.comboInfo.innerHTML = '<span class="tag tag-info">提示</span> 所有强度为 0，显示原图';
            return;
        }

        const n = w * h;
        const displaceBody = (tBody >= 0.01) ? this.buildBodyDisplacement(tBody, true) : new Float32Array(n);
        const displaceArm = (tArm >= 0.01) ? this.buildArmDisplacement(tArm) : new Float32Array(n);
        const displaceLeg = (tThigh >= 0.01 || tCalf >= 0.01) ? this.buildLegDisplacement(tThigh, tCalf) : new Float32Array(n);

        const combinedX = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            combinedX[i] = displaceBody[i] + displaceArm[i] + displaceLeg[i];
        }

        const displaceY = (tLeg >= 0.01) ? this.buildLongLegRemap(tLeg) : null;

        this.renderDisplacement(combinedX, this.els.comboCanvas, displaceY);

        const parts = [];
        if (tBody >= 0.01) parts.push(`上身 ${bodyIntensity}%`);
        if (tArm >= 0.01) parts.push(`手臂 ${armIntensity}%`);
        if (tThigh >= 0.01) parts.push(`大腿 ${thighIntensity}%`);
        if (tCalf >= 0.01) parts.push(`小腿 ${calfIntensity}%`);
        if (tLeg >= 0.01) parts.push(`长腿 ${longLegIntensity}%`);
        this.els.comboInfo.innerHTML =
            `<span class="tag tag-info">并联模式</span> 上身/手臂/瘦腿/长腿各自独立，一次双线性渲染<br>` +
            `<span class="tag tag-success">强度</span> ${parts.join(' · ')}<br>` +
            `<span class="tag tag-warning">算法</span> 瘦身瘦臂瘦腿=水平位移 · 长腿=垂直拉伸`;
    }

    // ==================== Utilities ====================

    sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// ==================== Polyfills ====================

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') r = [r, r, r, r];
        this.moveTo(x + r[0], y);
        this.lineTo(x + w - r[1], y);
        this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
        this.lineTo(x + w, y + h - r[2]);
        this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
        this.lineTo(x + r[3], y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
        this.lineTo(x, y + r[0]);
        this.quadraticCurveTo(x, y, x + r[0], y);
        this.closePath();
        return this;
    };
}

// ==================== Init ====================

document.addEventListener('DOMContentLoaded', () => { new BodySlimmer(); });
