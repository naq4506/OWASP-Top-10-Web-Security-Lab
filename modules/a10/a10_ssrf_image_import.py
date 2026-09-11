from flask import Flask, request, render_template_string
import os
import requests
import base64

def upload_image_url():
    message = ""
    image_base64 = ""   # Dùng khi cào được ảnh
    text_content = ""   # Dùng khi cào được chữ (text/html)

    if request.method == "POST":
        image_url = request.form.get("url", "")
        
        try:
            # Server thực hiện lệnh gọi mạng (SSRF)
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            response = requests.get(image_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                # Lấy kiểu dữ liệu trả về từ Server mục tiêu
                content_type = response.headers.get('Content-Type', '').lower()
                
                # TRƯỜNG HỢP 1: NẾU LÀ HÌNH ẢNH
                if 'image' in content_type:
                    encoded_string = base64.b64encode(response.content).decode('utf-8')
                    image_base64 = f"data:{content_type};base64,{encoded_string}"
                    message = "Server đã tải và hiển thị HÌNH ẢNH thành công!"
                
                # TRƯỜNG HỢP 2: NẾU LÀ VĂN BẢN/CHỮ (ifconfig, txt, html...)
                else:
                    text_content = response.text
                    message = "Server đã tải và hiển thị VĂN BẢN thô thành công!"
            else:
                message = f"Không thể tải dữ liệu. Mã lỗi HTTP: {response.status_code}"
        except Exception as e:
            message = f"Lỗi kết nối từ phía Server: {str(e)}"

    return render_template_string("""
    <h1>Profile Picture Importer (Bản Đa Năng - Cân cả Ảnh và Chữ)</h1>
    <p><i>Mô tả: Chọn một Avatar mặc định hoặc tráo đổi sang bất kỳ tài nguyên nào trên mạng.</i></p>
    
    <hr>
    
    <div style="display: flex; gap: 20px;">
        <div style="border: 1px solid #ccc; padding: 15px; text-align: center; background: #fafafa;">
            <p><b>Avatar Mèo Tom</b></p>
            <form method="POST">
                <input type="hidden" name="url" value="https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=150">
                <button type="submit">Sử dụng ảnh này</button>
            </form>
        </div>

        <div style="border: 1px solid #ccc; padding: 15px; text-align: center; background: #fafafa;">
            <p><b>Avatar Chó Spike</b></p>
            <form method="POST">
                <input type="hidden" name="url" value="https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=150">
                <button type="submit">Sử dụng ảnh này</button>
            </form>
        </div>
    </div>

    <p style="margin-top: 20px;"><b>Trạng thái hệ thống:</b> <span style="color: blue; font-weight: bold;">{{ message }}</span></p>

    {% if image_base64 or text_content %}
        <hr>
        <h3>[Dữ liệu phản hồi thu được từ cuộc gọi SSRF của Server]</h3>
        
        {% if image_base64 %}
            <div style="border: 2px dashed #28a745; padding: 15px; background: #f8f9fa; text-align: center;">
                <img src="{{ image_base64 }}" alt="SSRF Result Image" style="max-width: 300px; border-radius: 8px;">
            </div>
        {% endif %}
        
        {% if text_content %}
            <div style="border: 2px dashed #ffc107; padding: 15px; background: #f8f9fa; white-space: pre-wrap; font-family: monospace; font-size: 14px; text-align: left; color: #333;">
                {{ text_content }}
            </div>
        {% endif %}
    {% endif %}
    """, message=message, image_base64=image_base64, text_content=text_content)