document.addEventListener('DOMContentLoaded', function() {
    // Thêm sự kiện submit cho form và ngăn chặn hành động mặc định của form
    document.querySelector('.signInForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Ngăn không cho form submit theo cách thông thường
            // Khi form hợp lệ, gửi dữ liệu đến server
        
        const data = {
            userName: document.getElementById('userName').value,
            password: document.getElementById('password').value,
        };

        console.log(data);
        sendDataToServer(data);
    });
});

// Hàm hiển thị thông báo lỗi
function showError(inputElement, message) {
    const container = inputElement.parentElement;
    const errorDisplay = container.querySelector('.error-message');
    errorDisplay.textContent = message;
}

// Hàm gửi dữ liệu đến server
function sendDataToServer(data) {
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) { // Kiểm tra nếu phản hồi không thành công (mã lỗi HTTP 400 trở lên)
            throw new Error('Network response was not ok'); // Ném lỗi
        }
        return response.json(); // Chuyển đổi phản hồi thành JSON nếu phản hồi thành công
    })
    .then(data => {
        console.log('Success:', data);
        // Chỉ chuyển hướng khi dữ liệu đăng nhập hợp lệ
        window.location.href = `/home`;
    })
    .catch((error) => {
        console.error('Error:', error);
        // Xử lý lỗi tại đây, ví dụ: hiển thị thông báo lỗi cho người dùng
        // Đây là nơi bạn có thể hiển thị thông báo lỗi dựa trên kết quả từ server
        alert('Login failed: Invalid credentials'); // Thông báo lỗi
        // Không chuyển hướng ở đây
    });
}
