from flask import request, render_template_string
import pickle
import base64

def insecure_deserialization_lab():
    result = ""
    
    # Chỉ xử lý khi người dùng gửi dữ liệu qua form
    if request.method == "POST":
        user_payload = request.form.get("payload", "")
        if user_payload:
            try:
                # [LỖ HỔNG] Giải mã dữ liệu người dùng mà không qua xác thực
                # pickle.loads() sẽ thực thi code ngay khi nó giải mã xong
                decoded_data = base64.b64decode(user_payload)
                obj = pickle.loads(decoded_data)
                result = f"Deserialization thành công! Đối tượng: {obj}"
            except Exception as e:
                result = f"Lỗi thực thi: {str(e)}"
    
    # Giao diện lab
    return render_template_string("""
    <h1>A08 - Insecure Deserialization Lab</h1>
    <p>Nhập payload (Base64) đã được serialize để server thực thi.</p>
    
    <form method="POST">
        <textarea name="payload" rows="5" cols="50" placeholder="Nhập chuỗi Base64 tại đây..."></textarea><br>
        <button type="submit">Gửi Payload</button>
    </form>

    {% if result %}
        <hr>
        <p><b>Kết quả:</b> {{ result }}</p>
    {% endif %}
    """, result=result)