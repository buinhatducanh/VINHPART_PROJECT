// Script test kết nối Cloudinary
// Chạy: node test_cloudinary_connection.js

const cloudName = 'dmz66rbbk';
const uploadPreset = 'vinhpart_products_preset';

console.log('==========================================');
console.log('🔍 KIỂM TRA KẾT NỐI CLOUDINARY');
console.log('==========================================\n');

console.log('📋 Thông tin:');
console.log('  Cloud Name:', cloudName);
console.log('  Upload Preset:', uploadPreset);
console.log('  Upload Type: Unsigned\n');

console.log('==========================================');
console.log('✅ CÁCH TEST UPLOAD PRESET:');
console.log('==========================================\n');

console.log('1️⃣ Mở trình duyệt và vào:');
console.log('   👉 https://console.cloudinary.com/settings/upload\n');

console.log('2️⃣ Scroll xuống phần "Upload presets"\n');

console.log('3️⃣ Tìm preset tên: "vinhpart_products_preset"');
console.log('   ✅ Nếu CÓ → Kiểm tra Signing Mode = "Unsigned"');
console.log('   ❌ Nếu CHƯA CÓ → Làm theo bước 4\n');

console.log('4️⃣ Tạo preset mới (nếu chưa có):');
console.log('   a) Click "Add upload preset"');
console.log('   b) Preset name: vinhpart_products_preset');
console.log('   c) Signing Mode: Unsigned 🔓');
console.log('   d) Folder: vinhpart_products');
console.log('   e) Click "Save"\n');

console.log('==========================================');
console.log('🧪 TEST UPLOAD TỪ TRÌNH DUYỆT:');
console.log('==========================================\n');

const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Cloudinary Upload</title>
    <script src="https://widget.cloudinary.com/v2.0/global/all.js"></script>
</head>
<body>
    <h1>Test Cloudinary Upload</h1>
    <button id="upload_widget">Upload Image</button>
    
    <div id="result"></div>
    
    <script>
        var myWidget = cloudinary.createUploadWidget({
            cloudName: '${cloudName}',
            uploadPreset: '${uploadPreset}'
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                document.getElementById('result').innerHTML = 
                    '<p style="color: green">✅ Upload thành công!</p>' +
                    '<img src="' + result.info.secure_url + '" style="max-width: 300px"><br>' +
                    'URL: ' + result.info.secure_url;
            } else if (error) {
                document.getElementById('result').innerHTML = 
                    '<p style="color: red">❌ Lỗi: ' + JSON.stringify(error) + '</p>';
            }
        });
        
        document.getElementById('upload_widget').addEventListener('click', function(){
            myWidget.open();
        }, false);
    </script>
</body>
</html>
`;

// Lưu HTML test file
const fs = require('fs');
fs.writeFileSync('test_cloudinary.html', testHtml);

console.log('✅ Đã tạo file test_cloudinary.html');
console.log('   👉 Mở file này trong trình duyệt để test upload\n');

console.log('==========================================');
console.log('📝 KẾT LUẬN:');
console.log('==========================================\n');

console.log('Nếu upload thành công → Upload preset đã được tạo ✅');
console.log('Nếu lỗi 400 → Chưa tạo preset hoặc sai tên ❌\n');
