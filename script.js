document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. HIỆU ỨNG CHỮ TỰ GÕ (TYPED.JS)
       ========================================================================== */
    if (typeof Typed !== 'undefined') {
        new Typed('#typing-title', {
            strings: [
                `> Java Dev / BA Intern`,
                `> Problem Solver`,
                `> Bridging Business & Code`
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 1500,
            cursorChar: '▋',
            loop: true,
            contentType: 'html'
        });
    }

    /* ==========================================================================
       2. HỆ THỐNG ÂM THANH & WEB AUDIO API CHO 3D VISUALIZER
       ========================================================================== */
    const audio = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const musicDisk = document.getElementById('music-disk');
    const waveContainer = document.getElementById('wave-container');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const musicTime = document.getElementById('music-time');

    let audioContext = null;
    let analyserNode = null;
    let audioDataArray = null;
    let isAudioInitialized = false;

    // Khởi tạo AudioContext khi người dùng tương tác (tuân thủ chính sách Autoplay)
    function initWebAudio() {
        if (isAudioInitialized) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            audioContext = new AudioContextClass();
            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 64; // 32 frequency bins - tối ưu tốc độ phân tích thời gian thực
            analyserNode.smoothingTimeConstant = 0.8;

            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyserNode);
            analyserNode.connect(audioContext.destination);

            audioDataArray = new Uint8Array(analyserNode.frequencyBinCount);
            isAudioInitialized = true;
        } catch (err) {
            console.warn("Web Audio API fallback:", err);
        }
    }

    function formatTime(secs) {
        if (isNaN(secs)) return "00:00";
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    playBtn.addEventListener('click', () => {
        playBtn.classList.remove('animate-pulse');
        initWebAudio();

        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }

        if (audio.paused) {
            audio.play().catch(err => console.log("Lỗi phát audio:", err));
            playBtn.innerText = '⏸';
            musicDisk.classList.add('animate-spin');
            musicDisk.style.animationDuration = '8s';
            waveContainer.classList.remove('opacity-0');
        } else {
            audio.pause();
            playBtn.innerText = '▶';
            musicDisk.classList.remove('animate-spin');
            waveContainer.classList.add('opacity-0');
        }
    });

    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percent}%`;
        musicTime.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener('loadedmetadata', () => {
        musicTime.innerText = `00:00 / ${formatTime(audio.duration)}`;
    });

    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        audio.currentTime = (clickX / width) * audio.duration;
    });

    audio.addEventListener('ended', () => {
        playBtn.innerText = '▶';
        musicDisk.classList.remove('animate-spin');
        waveContainer.classList.add('opacity-0');
        progressBar.style.width = '0%';
    });


    /* ==========================================================================
       3. 3D PARALLAX TILT ENGINE (HIỆU ỨNG CHIỀU SÂU & GÓC NGHIÊNG THỰC)
       ========================================================================== */
    const mainCard = document.getElementById('main-card');
    const cardGlare = document.getElementById('card-glare');
    const telemetryTilt = document.getElementById('telemetry-tilt');
    const toggle3DView = document.getElementById('toggle-3d-view');

    let isTiltActive = true;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    const maxTilt = 9; // Góc nghiêng tối đa (độ) để giữ độ sắc nét

    function updateCardTilt() {
        if (isTiltActive) {
            // Nội suy Lerp cho chuyển động mượt mà như lò xo
            currentRotX += (targetRotX - currentRotX) * 0.1;
            currentRotY += (targetRotY - currentRotY) * 0.1;

            mainCard.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;

            // Cập nhật thông số HUD Telemetry
            if (telemetryTilt) {
                telemetryTilt.innerText = `PITCH: ${Math.round(currentRotX)}° | ROLL: ${Math.round(currentRotY)}°`;
            }
        } else {
            mainCard.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
            if (telemetryTilt) {
                telemetryTilt.innerText = `PITCH: 0° | ROLL: 0°`;
            }
        }
        requestAnimationFrame(updateCardTilt);
    }
    requestAnimationFrame(updateCardTilt);

    // Xử lý góc nghiêng theo con trỏ chuột trên toàn màn hình
    window.addEventListener('mousemove', (e) => {
        if (!isTiltActive) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const xPercent = (e.clientX / width) * 2 - 1; // [-1, 1]
        const yPercent = (e.clientY / height) * 2 - 1; // [-1, 1]

        targetRotX = -yPercent * maxTilt;
        targetRotY = xPercent * maxTilt;

        // Vị trí tia sáng Glare phản chiếu
        const cardRect = mainCard.getBoundingClientRect();
        if (
            e.clientX >= cardRect.left &&
            e.clientX <= cardRect.right &&
            e.clientY >= cardRect.top &&
            e.clientY <= cardRect.bottom
        ) {
            const glareX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
            const glareY = ((e.clientY - cardRect.top) / cardRect.height) * 100;
            cardGlare.style.setProperty('--glare-x', `${glareX}%`);
            cardGlare.style.setProperty('--glare-y', `${glareY}%`);
            cardGlare.style.opacity = '1';
        } else {
            cardGlare.style.opacity = '0';
        }
    });

    window.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
        cardGlare.style.opacity = '0';
    });

    // Hỗ trợ cảm biến con quay hồi chuyển trên điện thoại (Gyroscope 3D Tilt)
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            if (!isTiltActive || e.beta === null) return;
            // beta: [-180, 180] (trục X), gamma: [-90, 90] (trục Y)
            const beta = Math.max(-30, Math.min(30, e.beta - 45)); // Trừ 45 độ góc cầm tự nhiên
            const gamma = Math.max(-30, Math.min(30, e.gamma));
            targetRotX = -(beta / 30) * maxTilt;
            targetRotY = (gamma / 30) * maxTilt;
        });
    }

    // Nút Bật/Tắt hiệu ứng 3D Tilt
    if (toggle3DView) {
        toggle3DView.addEventListener('click', () => {
            isTiltActive = !isTiltActive;
            toggle3DView.innerText = isTiltActive ? 'TILT: ON' : 'TILT: OFF';
            toggle3DView.className = isTiltActive
                ? 'bg-purple-500/20 hover:bg-purple-500/40 text-pink-300 border border-pink-400/50 rounded-full px-2 py-0.5 text-[8px] md:text-[9px] transition-all cursor-pointer font-bold'
                : 'bg-gray-800 text-gray-400 border border-gray-600 rounded-full px-2 py-0.5 text-[8px] md:text-[9px] transition-all cursor-pointer font-bold';
        });
    }


    /* ==========================================================================
       4. THREE.JS 3D BACKGROUND ENGINE (CYBER GRID & KHÔNG GIAN TƯƠNG TÁC)
       ========================================================================== */
    const bgCanvas = document.getElementById('bg-3d');
    const toggle3DMode = document.getElementById('toggle-3d-mode');

    if (typeof THREE !== 'undefined' && bgCanvas) {
        const bgScene = new THREE.Scene();
        bgScene.fog = new THREE.FogExp2(0x04030a, 0.012);

        const bgCamera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        bgCamera.position.set(0, 4, 30);

        const bgRenderer = new THREE.WebGLRenderer({
            canvas: bgCanvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
        bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 4.1 Lưới Cyber Synthwave Grid 3D uốn lượn
        const gridGeometry = new THREE.PlaneGeometry(160, 160, 40, 40);
        gridGeometry.rotateX(-Math.PI / 2);

        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        const cyberGrid = new THREE.Mesh(gridGeometry, gridMaterial);
        cyberGrid.position.y = -10;
        bgScene.add(cyberGrid);

        // Lưu trữ vị trí gốc của các điểm đỉnh lưới để tạo sóng sin
        const gridPosAttr = gridGeometry.attributes.position;
        const gridOriginalY = new Float32Array(gridPosAttr.count);
        for (let i = 0; i < gridPosAttr.count; i++) {
            gridOriginalY[i] = gridPosAttr.getY(i);
        }

        // 4.2 Các khối hình học không gian 3D bay trôi (Floating Geometries)
        const floatingObjects = [];

        // Khối 1: Glowing Icosahedron (Cyan)
        const icoGeom = new THREE.IcosahedronGeometry(3.5, 1);
        const icoMat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const icosahedron = new THREE.Mesh(icoGeom, icoMat);
        icosahedron.position.set(-18, 5, -5);
        bgScene.add(icosahedron);
        floatingObjects.push({ mesh: icosahedron, rotSpeedX: 0.005, rotSpeedY: 0.008, floatOffset: 0 });

        // Khối 2: Glowing Octahedron (Pink)
        const octGeom = new THREE.OctahedronGeometry(3.2, 0);
        const octMat = new THREE.MeshBasicMaterial({
            color: 0xec4899,
            wireframe: true,
            transparent: true,
            opacity: 0.55
        });
        const octahedron = new THREE.Mesh(octGeom, octMat);
        octahedron.position.set(19, 7, -8);
        bgScene.add(octahedron);
        floatingObjects.push({ mesh: octahedron, rotSpeedX: -0.007, rotSpeedY: 0.006, floatOffset: 2 });

        // Khối 3: Glowing Torus Knot (Purple)
        const torusGeom = new THREE.TorusKnotGeometry(2.4, 0.5, 64, 8);
        const torusMat = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            wireframe: true,
            transparent: true,
            opacity: 0.45
        });
        const torusKnot = new THREE.Mesh(torusGeom, torusMat);
        torusKnot.position.set(16, -6, 2);
        bgScene.add(torusKnot);
        floatingObjects.push({ mesh: torusKnot, rotSpeedX: 0.006, rotSpeedY: -0.007, floatOffset: 4 });

        // Khối 4: Mini Dodecahedron (Emerald)
        const dodecaGeom = new THREE.DodecahedronGeometry(2.5, 0);
        const dodecaMat = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const dodeca = new THREE.Mesh(dodecaGeom, dodecaMat);
        dodeca.position.set(-15, -7, 0);
        bgScene.add(dodeca);
        floatingObjects.push({ mesh: dodeca, rotSpeedX: -0.005, rotSpeedY: -0.005, floatOffset: 1 });

        // 4.3 Dải hạt bụi sao số 3D (Particle Dust Cloud)
        const particleCount = 450;
        const particleGeom = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);

        const colorPalette = [
            new THREE.Color(0x06b6d4), // Cyan
            new THREE.Color(0xec4899), // Pink
            new THREE.Color(0xa855f7)  // Purple
        ];

        for (let i = 0; i < particleCount; i++) {
            particlePositions[i * 3] = (Math.random() - 0.5) * 120;
            particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

            const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            particleColors[i * 3] = chosenColor.r;
            particleColors[i * 3 + 1] = chosenColor.g;
            particleColors[i * 3 + 2] = chosenColor.b;
        }

        particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 1.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        const particleSystem = new THREE.Points(particleGeom, particleMat);
        bgScene.add(particleSystem);

        // 4.4 Sóng xung kích 3D Shockwave khi click chuột
        const shockwaveGeom = new THREE.RingGeometry(0.5, 1.2, 32);
        shockwaveGeom.rotateX(-Math.PI / 2);
        const shockwaveMat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const shockwave = new THREE.Mesh(shockwaveGeom, shockwaveMat);
        shockwave.position.y = -9.8;
        bgScene.add(shockwave);

        let shockwaveScale = 1;
        let isShockwaveActive = false;

        window.addEventListener('click', () => {
            shockwave.scale.set(1, 1, 1);
            shockwaveScale = 1;
            shockwaveMat.opacity = 0.9;
            isShockwaveActive = true;
        });

        // 4.5 Tương tác Camera theo chuột
        let mouseX = 0;
        let mouseY = 0;
        let targetCamX = 0;
        let targetCamY = 4;

        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            targetCamX = mouseX * 5;
            targetCamY = 4 + mouseY * 3;
        });

        // 4.6 Chế độ hiển thị 3D (3D Modes)
        let currentMode = 0;
        const modes = [
            { name: '🪐 CYBER GRID', gridColor: 0x06b6d4, showGrid: true, warp: false },
            { name: '✨ WARP STARS', gridColor: 0xec4899, showGrid: false, warp: true },
            { name: '💎 MATRIX CORE', gridColor: 0x10b981, showGrid: true, warp: false }
        ];

        if (toggle3DMode) {
            toggle3DMode.addEventListener('click', () => {
                currentMode = (currentMode + 1) % modes.length;
                const mode = modes[currentMode];
                toggle3DMode.innerText = mode.name;
                cyberGrid.visible = mode.showGrid;
                gridMaterial.color.setHex(mode.gridColor);
                if (currentMode === 2) {
                    icoMat.color.setHex(0x10b981);
                    octMat.color.setHex(0x06b6d4);
                } else {
                    icoMat.color.setHex(0x06b6d4);
                    octMat.color.setHex(0xec4899);
                }
            });
        }

        // Loop hoạt họa 3D Nền
        let clock = new THREE.Clock();

        function animateBg() {
            requestAnimationFrame(animateBg);
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            // Uốn sóng Cyber Grid theo hàm sóng hình sin
            if (cyberGrid.visible) {
                const pos = gridGeometry.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    const vx = pos.getX(i);
                    const vz = pos.getZ(i);
                    const waveY = Math.sin(vx * 0.12 + elapsed * 2.0) * Math.cos(vz * 0.12 + elapsed * 1.5) * 1.8;
                    pos.setY(i, gridOriginalY[i] + waveY);
                }
                pos.needsUpdate = true;
            }

            // Xoay và bập bênh các khối hình học
            floatingObjects.forEach(item => {
                item.mesh.rotation.x += item.rotSpeedX;
                item.mesh.rotation.y += item.rotSpeedY;
                item.mesh.position.y += Math.sin(elapsed * 1.8 + item.floatOffset) * 0.015;
            });

            // Di chuyển dải hạt
            const positions = particleGeom.attributes.position.array;
            const speed = modes[currentMode].warp ? 1.5 : 0.08;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3 + 2] += speed;
                if (positions[i * 3 + 2] > 40) {
                    positions[i * 3 + 2] = -40;
                }
            }
            particleGeom.attributes.position.needsUpdate = true;

            // Xử lý sóng xung kích Shockwave
            if (isShockwaveActive) {
                shockwaveScale += 1.2;
                shockwave.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
                shockwaveMat.opacity -= 0.025;
                if (shockwaveMat.opacity <= 0) {
                    isShockwaveActive = false;
                }
            }

            // Dịch chuyển Camera mượt mà
            bgCamera.position.x += (targetCamX - bgCamera.position.x) * 0.05;
            bgCamera.position.y += (targetCamY - bgCamera.position.y) * 0.05;
            bgCamera.lookAt(0, 0, 0);

            bgRenderer.render(bgScene, bgCamera);
        }
        animateBg();

        // Xử lý co giãn màn hình (Responsive Resize)
        window.addEventListener('resize', () => {
            bgCamera.aspect = window.innerWidth / window.innerHeight;
            bgCamera.updateProjectionMatrix();
            bgRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }


    /* ==========================================================================
       5. 3D HOLOGRAPHIC AUDIO VISUALIZER (THREE.JS + WEB AUDIO API)
       ========================================================================== */
    const visualizerCanvas = document.getElementById('audio-visualizer-3d');
    const visualizerHint = document.getElementById('visualizer-hint');

    if (typeof THREE !== 'undefined' && visualizerCanvas) {
        const visScene = new THREE.Scene();
        const visCamera = new THREE.PerspectiveCamera(50, visualizerCanvas.clientWidth / visualizerCanvas.clientHeight, 0.1, 100);
        visCamera.position.set(0, 0, 5.5);

        const visRenderer = new THREE.WebGLRenderer({
            canvas: visualizerCanvas,
            alpha: true,
            antialias: true
        });
        visRenderer.setSize(visualizerCanvas.clientWidth, visualizerCanvas.clientHeight);
        visRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 5.1 Khối Cyber Core trung tâm
        const coreGeom = new THREE.IcosahedronGeometry(1.4, 2);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.85
        });
        const cyberCore = new THREE.Mesh(coreGeom, coreMat);
        visScene.add(cyberCore);

        // 5.2 Vòng hào quang quỹ đạo ngoài
        const ringGeom = new THREE.TorusGeometry(2.1, 0.04, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xec4899,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });
        const outerRing = new THREE.Mesh(ringGeom, ringMat);
        visScene.add(outerRing);

        // 5.3 Vòng quỹ đạo phụ nghiêng
        const ring2Geom = new THREE.TorusGeometry(2.3, 0.03, 16, 64);
        const ring2Mat = new THREE.MeshBasicMaterial({
            color: 0xa855f7,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const outerRing2 = new THREE.Mesh(ring2Geom, ring2Mat);
        outerRing2.rotation.x = Math.PI / 3;
        visScene.add(outerRing2);

        // 5.4 Các hạt năng lượng lơ lửng quanh Core
        const sparkCount = 70;
        const sparkGeom = new THREE.BufferGeometry();
        const sparkPositions = new Float32Array(sparkCount * 3);
        for (let i = 0; i < sparkCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 1.6 + Math.random() * 0.8;
            sparkPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            sparkPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            sparkPositions[i * 3 + 2] = radius * Math.cos(phi);
        }
        sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
        const sparkMat = new THREE.PointsMaterial({
            color: 0x38bdf8,
            size: 0.08,
            transparent: true,
            opacity: 0.85
        });
        const sparkCloud = new THREE.Points(sparkGeom, sparkMat);
        visScene.add(sparkCloud);

        // 5.5 Tương tác kéo xoay 3D (Interactive Drag to Rotate)
        let isDragging = false;
        let prevMouseX = 0;
        let prevMouseY = 0;

        function onPointerDown(clientX, clientY) {
            isDragging = true;
            prevMouseX = clientX;
            prevMouseY = clientY;
            if (visualizerHint) visualizerHint.innerText = '🌀 Đang xoay 3D Core...';
        }

        function onPointerMove(clientX, clientY) {
            if (!isDragging) return;
            const deltaX = clientX - prevMouseX;
            const deltaY = clientY - prevMouseY;
            cyberCore.rotation.y += deltaX * 0.015;
            cyberCore.rotation.x += deltaY * 0.015;
            outerRing.rotation.y += deltaX * 0.01;
            outerRing2.rotation.x += deltaY * 0.01;
            prevMouseX = clientX;
            prevMouseY = clientY;
        }

        function onPointerUp() {
            isDragging = false;
            if (visualizerHint) {
                visualizerHint.innerText = audio && !audio.paused ? '🔥 Đang đập theo nhịp bass' : '🖱️ Kéo để xoay 3D';
            }
        }

        visualizerCanvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', onPointerUp);

        visualizerCanvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', onPointerUp);

        // 5.6 Loop hoạt họa và phản ứng tần số âm thanh thời gian thực
        let visClock = new THREE.Clock();

        function animateVisualizer() {
            requestAnimationFrame(animateVisualizer);
            const time = visClock.getElapsedTime();

            let bassLevel = 0;
            let trebleLevel = 0;

            if (isAudioInitialized && analyserNode && audio && !audio.paused) {
                analyserNode.getByteFrequencyData(audioDataArray);

                // Tính tần số âm trầm (Bass: 0 - 5)
                let bassSum = 0;
                for (let i = 0; i < 6; i++) {
                    bassSum += audioDataArray[i];
                }
                bassLevel = bassSum / (6 * 255); // Chuẩn hóa [0, 1]

                // Tính tần số âm cao (Treble: 18 - 30)
                let trebleSum = 0;
                for (let i = 18; i < 30; i++) {
                    trebleSum += audioDataArray[i];
                }
                trebleLevel = trebleSum / (12 * 255); // Chuẩn hóa [0, 1]

                // Co giãn lõi 3D theo nhịp Bass
                const targetScale = 1.0 + bassLevel * 0.65;
                cyberCore.scale.set(targetScale, targetScale, targetScale);

                // Đổi màu neon theo cường độ nhịp điệu
                if (bassLevel > 0.5) {
                    coreMat.color.setHex(0xec4899); // Pink neon rực rỡ khi bass mạnh
                } else if (bassLevel > 0.25) {
                    coreMat.color.setHex(0xa855f7); // Tím neon trung bình
                } else {
                    coreMat.color.setHex(0x06b6d4); // Cyan neon mặc định
                }

                // Xoay nhanh hơn khi có âm cao
                cyberCore.rotation.y += 0.02 + trebleLevel * 0.05;
                outerRing.rotation.z += 0.015 + bassLevel * 0.04;
                outerRing2.rotation.y += -0.015 - trebleLevel * 0.03;
                sparkCloud.rotation.y += 0.01 + bassLevel * 0.03;
            } else {
                // Hiệu ứng "Thở" tự nhiên (Breathing idle) khi chưa phát nhạc
                const breathe = 1.0 + Math.sin(time * 2.5) * 0.06;
                cyberCore.scale.set(breathe, breathe, breathe);
                coreMat.color.setHex(0x06b6d4);

                if (!isDragging) {
                    cyberCore.rotation.y += 0.008;
                    cyberCore.rotation.x = Math.sin(time) * 0.2;
                    outerRing.rotation.z += 0.01;
                    outerRing2.rotation.y -= 0.008;
                    sparkCloud.rotation.y += 0.005;
                }
            }

            visRenderer.render(visScene, visCamera);
        }
        animateVisualizer();

        // Tự động căn chỉnh kích thước visualizer khi layout thay đổi
        function resizeVisualizer() {
            const w = visualizerCanvas.clientWidth;
            const h = visualizerCanvas.clientHeight;
            if (w > 0 && h > 0) {
                visCamera.aspect = w / h;
                visCamera.updateProjectionMatrix();
                visRenderer.setSize(w, h);
            }
        }
        window.addEventListener('resize', resizeVisualizer);
        setTimeout(resizeVisualizer, 200);
    }
});