# 拾味山房 · 新中式山野料理预约系统

一个基于 **Flask + MySQL** 的餐厅全栈预订系统，包含从前端展示、预订表单提交，到后端数据持久化、异步邮件通知、商家后台管理的完整业务闭环。

## 🛠 技术栈

- **后端**：Python 3.10, Flask, PyMySQL
- **数据库**：MySQL 8.0
- **前端**：原生 HTML5, CSS3, JavaScript (Fetch API)
- **工具/库**：python-dotenv (环境变量隔离), smtplib (邮件通知), threading (异步处理)

## ✨ 核心功能

1. **在线预订**：前端实现表单校验（手机号正则匹配、日期限制等），通过 Fetch API 异步提交，提升用户体验。
2. **数据持久化**：后端接收 JSON 数据，通过 PyMySQL 存入 MySQL 数据库。
3. **异步邮件通知**：用户提交预订后，通过 Python 后台线程（Thread）发送 SMTP 邮件通知给餐厅负责人，**不阻塞主线程，避免用户等待**。
4. **商家管理后台**：提供 `/admin` 路由，商家可直观查看所有预订记录。
5. **安全加固**：使用 `python-dotenv` 将数据库密码、邮箱授权码等敏感信息隔离到 `.env` 文件中，并通过 `.gitignore` 防止隐私文件泄露。

## 📂 项目结构

```text
pythonProject/
├─ templates/          # 前端页面与静态资源
│  ├─ css/
│  ├─ js/
│  ├─ index.html       # 餐厅首页与预订表单
│  └─ admin.html       # 商家管理后台
├─ main.py             # Flask 后端核心逻辑
├─ .env                # 敏感配置（不上传到 Git）
├─ .gitignore          # Git 忽略规则
└─ README.md



🚀 本地运行方法
1. 克隆代码
bash
git clone https://github.com/788777/Shiwei-Shanfang-Restaurant.git
cd Shiwei-Shanfang-Restaurant


2. 安装依赖
bash
pip install flask flask-cors pymysql cryptography python-dotenv


3. 配置数据库
在 MySQL Workbench 中执行以下 SQL 建库建表：

sql
CREATE DATABASE restaurant_db;

USE restaurant_db;

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    reserve_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    people_count VARCHAR(50) NOT NULL,
    occasion VARCHAR(50),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


4. 配置环境变量
在项目根目录创建 .env 文件，并填入你的实际配置：

text
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=restaurant_db

# 邮件通知配置（以QQ邮箱为例，密码填授权码，非QQ密码）
EMAIL_SENDER=你的QQ邮箱@qq.com
EMAIL_PASSWORD=你的QQ邮箱授权码
EMAIL_RECEIVER=接收通知的邮箱@qq.com


5. 启动后端服务
bash
python main.py


6. 访问页面
前端预订页面：http://127.0.0.1:5000

商家管理后台：http://127.0.0.1:5000/admin


### 🖼️ 项目截图

**图 1：顾客预订主界面**
![首页展示](https://github.com/user-attachments/assets/366f9f4f-3ccf-4edb-9306-afc5bcebbf78)

**图 2：商家管理后台界面**
![后台管理](https://github.com/user-attachments/assets/1a22581a-590b-49f0-a857-950765899780)


💡 未来优化计划
□ 将 people_count 字段由字符串改为整数类型，便于后续数据统计分析。
□ 引入 Flask-Login 为 /admin 管理后台增加登录鉴权。
□ 使用 HTML 模板美化通知邮件。
□ 部署到云服务器，实现公网访问。
