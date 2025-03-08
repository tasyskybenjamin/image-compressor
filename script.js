document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.querySelector('.upload-btn');
    const previewContainer = document.querySelector('.preview-container');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const imageList = document.getElementById('imageList');

    let originalImage = null;
    let imagesToProcess = [];

    // 上传按钮点击事件
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择事件
    fileInput.addEventListener('change', handleFilesSelect);

    // 拖拽事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(Array.from(files));
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
        // 重新压缩所有图片
        imagesToProcess.forEach(item => {
            compressImageInList(item.file, item.element);
        });
        // 更新当前预览的图片
        if (originalImage) {
            compressImage(originalImage);
        }
    });

    function handleFilesSelect(e) {
        const files = Array.from(e.target.files);
        handleFiles(files);
    }

    function handleFiles(files) {
        // 限制文件数量
        if (files.length > 10) {
            alert('一次最多只能上传10张图片！');
            return;
        }

        // 过滤非图片文件
        const imageFiles = files.filter(file => file.type.match('image.*'));
        if (imageFiles.length === 0) {
            alert('请选择图片文件！');
            return;
        }

        // 清空之前的图片列表
        imagesToProcess = [];
        imageList.innerHTML = '';
        previewContainer.style.display = 'block';

        // 添加图片到列表
        imageFiles.forEach((file, index) => {
            addImageToList(file, index);
        });

        // 显示第一张图片的预览
        if (imageFiles.length > 0) {
            handleFile(imageFiles[0]);
        }
    }

    function addImageToList(file, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'image-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="预览图片">
                <div class="item-info">
                    <div>${file.name}</div>
                    <div class="size-info">原始：${formatFileSize(file.size)} / 压缩后：--</div>
                    <div class="status">待处理</div>
                </div>
                <button class="remove-btn" data-index="${index}">×</button>
            `;

            // 添加删除按钮事件
            div.querySelector('.remove-btn').addEventListener('click', () => {
                imagesToProcess = imagesToProcess.filter((_, i) => i !== index);
                div.remove();
                if (imagesToProcess.length === 0) {
                    previewContainer.style.display = 'none';
                }
            });

            imageList.appendChild(div);
            imagesToProcess.push({
                file,
                element: div
            });

            // 立即压缩这张图片
            compressImageInList(file, div);
        };
        reader.readAsDataURL(file);
    }

    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('请选择图片文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = new Image();
            originalImage.onload = () => {
                displayOriginalImage(file);
                compressImage(originalImage);
                previewContainer.style.display = 'grid';
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function displayOriginalImage(file) {
        originalPreview.src = URL.createObjectURL(file);
        originalSize.textContent = formatFileSize(file.size);
    }

    function compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const quality = qualitySlider.value / 100;
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        compressedPreview.src = compressedDataUrl;

        // 计算压缩后的大小
        const base64String = compressedDataUrl.split(',')[1];
        const compressedSize = Math.round((base64String.length * 3) / 4);
        document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);

        // 设置下载按钮
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = 'compressed_image.jpg';
            link.href = compressedDataUrl;
            link.click();
        };

        // 更新当前处理图片的状态
        const currentIndex = imagesToProcess.findIndex(item => 
            item.file.name === img.name);
        if (currentIndex !== -1) {
            const statusEl = imagesToProcess[currentIndex].element.querySelector('.status');
            statusEl.textContent = '已压缩';
            imagesToProcess[currentIndex].element.classList.add('processed');
        }
    }

    // 添加新函数：压缩列表中的图片
    function compressImageInList(file, element) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const quality = qualitySlider.value / 100;
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            // 计算压缩后的大小
            const base64String = compressedDataUrl.split(',')[1];
            const compressedSize = Math.round((base64String.length * 3) / 4);

            // 更新压缩后的大小显示
            const sizeInfo = element.querySelector('.size-info');
            sizeInfo.textContent = `原始：${formatFileSize(file.size)} / 压缩后：${formatFileSize(compressedSize)}`;

            // 更新状态
            const statusEl = element.querySelector('.status');
            statusEl.textContent = '已压缩';
            element.classList.add('processed');

            // 保存压缩后的数据
            element.dataset.compressedData = compressedDataUrl;
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 修改下载按钮逻辑，支持批量下载
    downloadBtn.onclick = () => {
        imagesToProcess.forEach((item, index) => {
            if (item.element.classList.contains('processed')) {
                const link = document.createElement('a');
                const fileName = item.file.name.replace(/\.[^/.]+$/, '');
                link.download = `${fileName}_compressed.jpg`;
                link.href = item.element.dataset.compressedData;
                setTimeout(() => link.click(), index * 100);
            }
        });
    };

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 