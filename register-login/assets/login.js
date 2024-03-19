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
        localStorage.setItem("userName", data.userName);
        localStorage.setItem("password", data.password);
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
            throw new Error('Network response was not stable'); // Ném lỗi
        }
        return response.json(); // Chuyển đổi phản hồi thành JSON nếu phản hồi thành công
    })
    .then(data => {
        console.log('Success:', data);
        localStorage.setItem("userID", data.id);
        getHome();
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Login failed: Invalid credentials');
        // Xử lý lỗi, ví dụ: hiển thị thông báo lỗi
    });
}

function getHome() {
// Dữ liệu cần gửi
const dataToSend = {
    userID: localStorage.getItem('userID')
  };
  
  // Biến đổi dữ liệu thành query string
  const queryString = new URLSearchParams(dataToSend).toString();
  
  // Gửi yêu cầu GET đến backend
  fetch(`/home?${queryString}`)
    .then(response => {
        console.log(response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      window.location.href = response.url;
      //return response.json();
    })
    //.then(data => {
    //  console.log(data);
      
      // Xử lý kết quả
    //})
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
}
