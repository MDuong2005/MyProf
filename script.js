document.addEventListener('DOMContentLoaded', () => {
    // 1. HIỆU ỨNG CHỮ TỰ GÕ (TYPED.JS) CHO CODE JAVA
    new Typed('#typing-title', {
        strings: [
            `> Java Dev / BA Intern`
        ],
        typeSpeed: 50,        // Tốc độ gõ chữ (ms)
        backSpeed: 0,         
        cursorChar: '▋',      
        loop: false,          
        contentType: 'html'
    });

    // 2. LOGIC TƯƠNG TÁC CHO MÁY NGHE NHẠC (MUSIC PLAYER)
    const audio = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const musicDisk = document.getElementById('music-disk');
    const waveContainer = document.getElementById('wave-container');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const musicTime = document.getElementById('music-time');

    // Hàm chuyển đổi số giây thành định dạng mm:ss
    function formatTime(secs) {
        if (isNaN(secs)) return "00:00";
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // Xử lý sự kiện khi click nút Play/Pause
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(err => console.log("Trình duyệt chặn tự động phát:", err));
            playBtn.innerText = '⏸';
            musicDisk.classList.add('animate-spin'); // Đĩa nhạc xoay tròn
            musicDisk.style.animationDuration = '8s';
            waveContainer.classList.remove('opacity-0'); // Hiện sóng nhạc
        } else {
            audio.pause();
            playBtn.innerText = '▶';
            musicDisk.classList.remove('animate-spin'); // Dừng xoay đĩa
            waveContainer.classList.add('opacity-0'); // Ẩn sóng nhạc
        }
    });

    // Cập nhật thanh tiến độ và thời gian chạy liên tục
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percent}%`;
        musicTime.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    // Hiển thị tổng thời lượng ngay khi file nhạc được load xong
    audio.addEventListener('loadedmetadata', () => {
        musicTime.innerText = `00:00 / ${formatTime(audio.duration)}`;
    });

    // Click chuột vào một vị trí bất kỳ trên thanh tiến độ để tua nhạc
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        audio.currentTime = (clickX / width) * audio.duration;
    });

    // Tự động reset trạng thái giao diện khi bài nhạc chạy hết
    audio.addEventListener('ended', () => {
        playBtn.innerText = '▶';
        musicDisk.classList.remove('animate-spin');
        waveContainer.classList.add('opacity-0');
        progressBar.style.width = '0%';
    });
});