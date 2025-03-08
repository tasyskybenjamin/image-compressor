const express = require('express');
const app = express();
const path = require('path');

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 