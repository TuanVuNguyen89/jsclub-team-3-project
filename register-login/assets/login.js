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
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = `/home`;
    })
    .catch((error) => {
        console.error('Error:', error);
        // Xử lý lỗi, ví dụ: hiển thị thông báo lỗi
    });
}