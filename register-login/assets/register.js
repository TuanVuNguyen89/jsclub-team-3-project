document.addEventListener('DOMContentLoaded', function() {
    // Thêm sự kiện blur để xác thực từng trường input khi người dùng rời khỏi trường đó
    document.getElementById('fullName').addEventListener('blur', validateFullName);
    document.getElementById('userName').addEventListener('blur', validateUserName);
    document.getElementById('mail').addEventListener('blur', validateEmail);
    document.getElementById('password').addEventListener('blur', validatePassword);
    document.getElementById('confirmPassword').addEventListener('blur', validateConfirmPassword);

    // Thêm sự kiện submit cho form và ngăn chặn hành động mặc định của form
    document.querySelector('.registerForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Ngăn không cho form submit theo cách thông thường
        //console.log("*");
        if(validateForm()) {
            //console.log("**");
            // Khi form hợp lệ, gửi dữ liệu đến server
            const data = {
                name: document.getElementById('fullName').value,
                userName: document.getElementById('userName').value,
                mail: document.getElementById('mail').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value,
                phone: document.getElementById('phone').value
            };
            sendDataToServer(data);
        }
    });
});

// Hàm xác thực form
function validateForm() {
    return validateFullName() && validateEmail() && validatePassword() && validateConfirmPassword() && validateUserName();
}

// Hàm xác thực họ và tên
function validateFullName() {
    const fullName = document.getElementById('fullName');
    if(fullName.value.trim() === '') {
        showError(fullName, 'Vui lòng nhập họ và tên');
        return false;
    } else {
        showError(fullName, '');
        return true;
    }
}
// Hàm xác thực username
function validateUserName() {
    const userName = document.getElementById('userName');
    const userNameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if(!userNameRegex.test(userName.value)) {
        showError(userName, 'username phải dài ít nhất 8 ký tự và bao gồm chữ cái và số');
        return false;
    } else {
        showError(userName, '');
        return true;
    }
}
// Hàm xác thực email
function validateEmail() {
    const email = document.getElementById('mail');
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if(!emailRegex.test(email.value)) {
        showError(email, 'Địa chỉ email không hợp lệ');
        return false;
    } else {
        showError(email, '');
        return true;
    }
}

// Hàm xác thực mật khẩu
function validatePassword() {
    const password = document.getElementById('password');
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if(!passwordRegex.test(password.value)) {
        showError(password, 'Mật khẩu phải dài ít nhất 8 ký tự và bao gồm chữ cái và số');
        return false;
    } else {
        showError(password, '');
        return true;
    }
}

// Hàm xác thực xác nhận mật khẩu
function validateConfirmPassword() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    if(confirmPassword.value !== password.value) {
        showError(confirmPassword, 'Mật khẩu xác nhận không khớp');
        return false;
    } else {
        showError(confirmPassword, '');
        return true;
    }
}

// Hàm hiển thị thông báo lỗi
function showError(inputElement, message) {
    const container = inputElement.parentElement;
    const errorDisplay = container.querySelector('.error-message');
    errorDisplay.textContent = message;
}

// Hàm gửi dữ liệu đến server
function sendDataToServer(data) {
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) { // Nếu phản hồi không phải là OK (200-299)
            throw new Error('Network response was not stable');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        window.location.href = `/login`;
    })
    .catch((error) => {
        console.error('Error:', error);
        // Xử lý lỗi, ví dụ: hiển thị thông báo lỗi
        alert('Registration failed: Username already exists.');
    });
}