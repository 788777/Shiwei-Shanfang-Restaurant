from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pymysql
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from threading import Thread



load_dotenv()

app = Flask(__name__)
CORS(app)


def send_email_notification(data):
    """后台发送邮件通知（异步）"""
    try:
        sender = os.getenv('EMAIL_SENDER')
        password = os.getenv('EMAIL_PASSWORD')
        receiver = os.getenv('EMAIL_RECEIVER')

        subject = f"【新预订】{data.get('name')} - {data.get('date')} {data.get('timeSlot')}"
        body = f"""
        收到新预订：
        姓名：{data.get('name')}
        手机：{data.get('phone')}
        日期：{data.get('date')}
        时段：{data.get('timeSlot')}
        人数：{data.get('people')}
        事由：{data.get('occasion')}
        备注：{data.get('remark')}
        """
        msg = MIMEText(body, 'plain', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = receiver

        server = smtplib.SMTP_SSL('smtp.qq.com', 465)
        server.login(sender, password)
        server.sendmail(sender, [receiver], msg.as_string())
        server.quit()
        print("邮件发送成功！")
    except Exception as e:
        print(f"邮件发送失败: {e}")

@app.route('/admin')
def admin():
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'), user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'), database=os.getenv('DB_NAME'),
        charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor
    )
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reservations ORDER BY created_at DESC")
    reservations = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('admin.html', reservations=reservations)

# 🆕 处理 CSS 静态文件（不需要移动文件夹）
@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('templates/css', path)

# 🆕 处理 JS 静态文件（不需要移动文件夹）
@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('templates/js', path)

# 🆕 处理图片静态文件（不需要移动文件夹）
@app.route('/generated-images/<path:path>')
def send_images(path):
    return send_from_directory('templates/generated-images', path)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/reserve', methods=['POST'])
def reserve():
    data = request.json
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        sql = """
        INSERT INTO reservations 
        (name, phone, reserve_date, time_slot, people_count, occasion, remark) 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            data.get('name'),
            data.get('phone'),
            data.get('date'),
            data.get('timeSlot'),
            data.get('people'),
            data.get('occasion'),
            data.get('remark', '')
        ))
        conn.commit()

        # 🆕 新增：异步发送邮件通知（必须放在 try 块里的 commit 之后）
        Thread(target=send_email_notification, args=(data,)).start()

        # 成功后返回
        return jsonify({"code": 200, "message": "预订成功！"})

    except Exception as e:
        if 'conn' in locals(): conn.rollback()
        # 失败时返回错误信息
        return jsonify({"code": 500, "message": f"数据库错误: {str(e)}"})

    finally:
        # finally 只负责收尾清理，绝不包含 return！
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)