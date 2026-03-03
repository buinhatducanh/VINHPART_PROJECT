export type ModalContentType =
    | 'about'
    | 'contact'
    | 'recruitment'
    | 'warranty'
    | 'return'
    | 'shipping'
    | 'shopping-guide'
    | 'faq'
    | 'payment';

export interface ModalContent {
    title: string;
    content: React.ReactNode;
}

export const modalContents: Record<ModalContentType, ModalContent> = {
    about: {
        title: 'Giới thiệu',
        content: (
            <div className= "space-y-4 text-muted-foreground" >
            <p className="text-lg leading-relaxed">
                <span className="text-red-500 font-bold"> AutoParts </span> là đơn vị hàng đầu chuyên cung cấp phụ tùng ô tô và xe máy chính hãng tại Việt Nam.
                    </p>
                    <p className="leading-relaxed" >
                    Với hơn<span className = "text-foreground font-semibold">10 năm kinh nghiệm</span > trong ngành, chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng cao nhất với giá cả cạnh tranh nhất.
        </p>
                        <div className="bg-muted border border-border rounded-lg p-4 mt-6" >
                        <h3 className="text-foreground font-bold mb-3"> Tầm nhìn & Sứ mệnh</h3>
                            <ul className = "space-y-2 text-sm" >
                                <li className="flex items-start gap-2" >
                                    <span className="text-red-500 mt-1" >✓</span>
                                        <span > Trở thành nhà cung cấp phụ tùng uy tín số 1 Việt Nam </span>
                                            </li>
                                            <li className = "flex items-start gap-2" >
                                                <span className="text-red-500 mt-1" >✓</span>
                                                    <span > Đảm bảo 100 % sản phẩm chính hãng, nguồn gốc rõ ràng </span>
                                                        </li>
                                                        <li className = "flex items-start gap-2" >
                                                            <span className="text-red-500 mt-1" >✓</span>
                                                                <span > Mang đến trải nghiệm mua sắm tốt nhất cho khách hàng </span>
                                                                    </li>
                                                                    </ul>
                                                                    </div>
                                                                    <div className = "mt-6" >
                                                                        <h3 className="text-foreground font-bold mb-3" > Giá trị cốt lõi </h3>
                                                                            <div className = "grid grid-cols-2 gap-3" >
                                                                                <div className="bg-muted/50 border border-border rounded-lg p-3" >
                                                                                    <div className="text-red-500 font-bold mb-1" > Chất lượng </div>
                                                                                        <div className = "text-xs text-muted-foreground" > Sản phẩm chính hãng 100 % </div>
                                                                                            </div>
                                                                                            <div className = "bg-muted/50 border border-border rounded-lg p-3" >
                                                                                                <div className="text-red-500 font-bold mb-1" > Uy tín </div>
                                                                                                    <div className = "text-xs text-muted-foreground" > Cam kết bảo hành đầy đủ </div>
                                                                                                        </div>
                                                                                                        <div className = "bg-muted/50 border border-border rounded-lg p-3" >
                                                                                                            <div className="text-red-500 font-bold mb-1" > Tận tâm </div>
                                                                                                                <div className = "text-xs text-muted-foreground" > Hỗ trợ 24 / 7 </div>
                                                                                                                    </div>
                                                                                                                    <div className = "bg-muted/50 border border-border rounded-lg p-3" >
                                                                                                                        <div className="text-red-500 font-bold mb-1" > Đổi mới </div>
                                                                                                                            <div className = "text-xs text-muted-foreground" > Công nghệ hiện đại </div>
                                                                                                                                </div>
                                                                                                                                </div>
                                                                                                                                </div>
                                                                                                                                </div>
    ),
  },
contact: {
    title: 'Liên hệ',
        content: (
            <div className= "space-y-6 text-muted-foreground" >
            <p className="text-lg" >
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!
                    </p>

                    <div className = "space-y-4" >
                        <div className="bg-muted border border-border rounded-lg p-4" >
                            <h3 className="text-foreground font-bold mb-3 flex items-center gap-2" >
                                <span className="text-red-500" >📞</span> Hotline
                                    </h3>
                                    <p className = "text-xl font-bold text-red-500" > 1900 xxxx </p>
                                        <p className = "text-sm text-muted-foreground mt-1" > Hỗ trợ 24 / 7 </p>
                                            </div>

                                            <div className = "bg-muted border border-border rounded-lg p-4" >
                                                <h3 className="text-foreground font-bold mb-3 flex items-center gap-2" >
                                                    <span className="text-red-500" >✉️</span> Email
                                                        </h3>
                                                        <p className = "text-lg text-foreground" > support@autoparts.vn</p>
                                                            <p className = "text-sm text-muted-foreground mt-1" > Phản hồi trong vòng 24h </p>
                                                                </div>

                                                                <div className = "bg-muted border border-border rounded-lg p-4" >
                                                                    <h3 className="text-foreground font-bold mb-3 flex items-center gap-2" >
                                                                        <span className="text-red-500" >⏰</span> Giờ làm việc
                                                                            </h3>
                                                                            <div className = "space-y-1" >
                                                                                <p className="text-foreground"> Thứ 2 - Thứ 7: <span className="text-red-500 font-semibold"> 8:00 - 22:00 </span></p>
<p className="text-foreground"> Chủ nhật: <span className="text-red-500 font-semibold"> 8:00 - 18:00 </span></p>
                                                                                        </div>
                                                                                        </div>

                                                                                        <div className = "bg-muted border border-border rounded-lg p-4" >
                                                                                            <h3 className="text-foreground font-bold mb-3 flex items-center gap-2" >
                                                                                                <span className="text-red-500" >📍</span> Địa chỉ
                                                                                                    </h3>
                                                                                                    <p className = "text-foreground" > Số 123 Đường ABC, Quận XYZ </p>
                                                                                                        <p className = "text-muted-foreground" > Thành phố Hồ Chí Minh, Việt Nam </p>
                                                                                                            </div>
                                                                                                            </div>

                                                                                                            <div className = "bg-red-900/20 border border-red-800 rounded-lg p-4" >
                                                                                                                <p className="text-sm text-red-400" >
            💡 <span className="font-semibold" > Lưu ý: </span> Để được hỗ trợ nhanh nhất, vui lòng cung cấp mã đơn hàng hoặc thông tin sản phẩm khi liên hệ.
        </p>
        </div>
        </div>
    ),
},
recruitment: {
    title: 'Tuyển dụng',
        content: (
            <div className= "space-y-4 text-muted-foreground" >
            <p className="text-lg leading-relaxed" >
                Gia nhập đội ngũ <span className = "text-red-500 font-bold" > AutoParts </span> - nơi tài năng được tôn vinh!
                    </p>

                    <div className = "bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-800 rounded-lg p-4" >
                        <h3 className="text-foreground font-bold mb-2" >🎯 Tại sao chọn AutoParts ? </h3>
                            <ul className = "space-y-2 text-sm" >
                                <li className="flex items-start gap-2" >
                                    <span className="text-red-500 mt-1" >✓</span>
                                        <span > Môi trường làm việc chuyên nghiệp, năng động </span>
                                            </li>
                                            <li className = "flex items-start gap-2" >
                                                <span className="text-red-500 mt-1" >✓</span>
                                                    <span > Lương thưởng cạnh tranh, đánh giá công bằng </span>
                                                        </li>
                                                        <li className = "flex items-start gap-2" >
                                                            <span className="text-red-500 mt-1" >✓</span>
                                                                <span > Cơ hội thăng tiến rõ ràng </span>
                                                                    </li>
                                                                    <li className = "flex items-start gap-2" >
                                                                        <span className="text-red-500 mt-1" >✓</span>
                                                                            <span > Đào tạo và phát triển kỹ năng liên tục </span>
                                                                                </li>
                                                                                </ul>
                                                                                </div>

                                                                                <div className = "space-y-3 mt-6" >
                                                                                    <h3 className="text-foreground font-bold" >📋 Vị trí đang tuyển </h3>

                                                                                        <div className = "bg-muted border border-border rounded-lg p-4 hover:border-red-600/50 transition-all" >
                                                                                            <h4 className="text-foreground font-semibold mb-2" > Nhân viên Kinh doanh </h4>
                                                                                                <p className = "text-sm text-muted-foreground mb-2" > Mức lương: 10 - 15 triệu + Hoa hồng </p>
                                                                                                    <div className = "flex flex-wrap gap-2" >
                                                                                                        <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded" > Full - time </span>
                                                                                                            <span className = "px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded" > TP.HCM </span>
                                                                                                                </div>
                                                                                                                </div>

                                                                                                                <div className = "bg-muted border border-border rounded-lg p-4 hover:border-red-600/50 transition-all" >
                                                                                                                    <h4 className="text-foreground font-semibold mb-2" > Kỹ thuật viên Ô tô </h4>
                                                                                                                        <p className = "text-sm text-muted-foreground mb-2" > Mức lương: 12 - 18 triệu </p>
                                                                                                                            <div className = "flex flex-wrap gap-2" >
                                                                                                                                <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded" > Full - time </span>
                                                                                                                                    <span className = "px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded" > TP.HCM </span>
                                                                                                                                        </div>
                                                                                                                                        </div>

                                                                                                                                        <div className = "bg-muted border border-border rounded-lg p-4 hover:border-red-600/50 transition-all" >
                                                                                                                                            <h4 className="text-foreground font-semibold mb-2" > Chuyên viên Marketing </h4>
                                                                                                                                                <p className = "text-sm text-muted-foreground mb-2" > Mức lương: 8 - 12 triệu </p>
                                                                                                                                                    <div className = "flex flex-wrap gap-2" >
                                                                                                                                                        <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded" > Full - time </span>
                                                                                                                                                            <span className = "px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded" > Remote </span>
                                                                                                                                                                </div>
                                                                                                                                                                </div>
                                                                                                                                                                </div>

                                                                                                                                                                <div className = "bg-muted border border-border rounded-lg p-4 mt-6" >
                                                                                                                                                                    <h3 className="text-foreground font-bold mb-2" >📧 Ứng tuyển ngay </h3>
                                                                                                                                                                        <p className = "text-sm text-muted-foreground mb-2" >
                                                                                                                                                                            Gửi CV về: <span className="text-foreground font-semibold" > hr@autoparts.vn</span>
                                                                                                                                                                                </p>
                                                                                                                                                                                <p className = "text-xs text-muted-foreground" >
                                                                                                                                                                                    Tiêu đề email: [Vị trí ứng tuyển] - [Họ tên]
                                                                                                                                                                                        </p>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        </div>
    ),
},
warranty: {
    title: 'Chính sách bảo hành',
        content: (
            <div className= "space-y-4 text-muted-foreground" >
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4" >
                <p className="text-foreground font-semibold" >
            ✓ Tất cả sản phẩm tại AutoParts đều được bảo hành chính hãng
        </p>
        </div>

        <div className = "space-y-3" >
            <h3 className="text-foreground font-bold" >📋 Điều kiện bảo hành </h3>
                <ul className = "space-y-2 text-sm list-disc list-inside" >
                    <li>Sản phẩm còn trong thời hạn bảo hành </li>
                        <li > Tem bảo hành còn nguyên vẹn, không rách, mờ </li>
                            <li > Sản phẩm bị lỗi do nhà sản xuất </li>
                                <li > Có đầy đủ hóa đơn mua hàng </li>
                                    </ul>
                                    </div>

                                    <div className = "space-y-3" >
                                        <h3 className="text-foreground font-bold" >⏱️ Thời gian bảo hành </h3>
                                            <div className = "bg-muted border border-border rounded-lg overflow-hidden" >
                                                <div className="grid grid-cols-2 border-b border-border" >
                                                    <div className="p-3 bg-muted/50 font-semibold text-foreground" > Loại sản phẩm </div>
                                                        <div className = "p-3 bg-muted/50 font-semibold text-foreground" > Thời gian </div>
                                                            </div>
                                                            <div className = "grid grid-cols-2 border-b border-border" >
                                                                <div className="p-3" > Phụ tùng động cơ </div>
                                                                    <div className = "p-3 text-red-500 font-semibold" > 12 tháng </div>
                                                                        </div>
                                                                        <div className = "grid grid-cols-2 border-b border-border" >
                                                                            <div className="p-3" > Phụ tùng điện </div>
                                                                                <div className = "p-3 text-red-500 font-semibold" > 6 tháng </div>
                                                                                    </div>
                                                                                    <div className = "grid grid-cols-2 border-b border-border" >
                                                                                        <div className="p-3" > Phụ kiện trang trí </div>
                                                                                            <div className = "p-3 text-red-500 font-semibold" > 3 tháng </div>
                                                                                                </div>
                                                                                                <div className = "grid grid-cols-2" >
                                                                                                    <div className="p-3" > Dầu nhớt, hóa chất </div>
                                                                                                        <div className = "p-3 text-red-500 font-semibold" > 1 tháng </div>
                                                                                                            </div>
                                                                                                            </div>
                                                                                                            </div>

                                                                                                            <div className = "space-y-3" >
                                                                                                                <h3 className="text-foreground font-bold" >❌ Trường hợp không bảo hành </h3>
                                                                                                                    <ul className = "space-y-2 text-sm list-disc list-inside text-red-400" >
                                                                                                                        <li>Sản phẩm hư hỏng do người dùng </li>
                                                                                                                            <li > Tự ý sửa chữa, can thiệp vào sản phẩm </li>
                                                                                                                                <li > Hư hỏng do thiên tai, hỏa hoạn </li>
                                                                                                                                    <li > Sử dụng sai mục đích </li>
                                                                                                                                        </ul>
                                                                                                                                        </div>

                                                                                                                                        <div className = "bg-muted border border-border rounded-lg p-4" >
                                                                                                                                            <h3 className="text-foreground font-bold mb-2" >📞 Liên hệ bảo hành </h3>
                                                                                                                                                <p className = "text-sm" > Hotline: <span className="text-red-500 font-bold" > 1900 xxxx </span></p >
                                                                                                                                                    <p className="text-sm" > Email: <span className="text-foreground" > warranty@autoparts.vn</span></p >
                                                                                                                                                        </div>
                                                                                                                                                        </div>
    ),
},
return: {
    title: 'Chính sách đổi trả',
        content: (
            <div className= "space-y-4 text-muted-foreground" >
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4" >
                <p className="text-foreground font-semibold" >
            ✓ Đổi trả miễn phí trong vòng 30 ngày
        </p>
        </div>

        <div className = "space-y-3" >
            <h3 className="text-foreground font-bold" >📋 Điều kiện đổi trả </h3>
                <ul className = "space-y-2 text-sm" >
                    <li className="flex items-start gap-2" >
                        <span className="text-green-500 mt-1" >✓</span>
                            <span > Sản phẩm chưa qua sử dụng, còn nguyên tem mác </span>
                                </li>
                                <li className = "flex items-start gap-2" >
                                    <span className="text-green-500 mt-1" >✓</span>
                                        <span > Còn đầy đủ hộp, phụ kiện đi kèm </span>
                                            </li>
                                            <li className = "flex items-start gap-2" >
                                                <span className="text-green-500 mt-1" >✓</span>
                                                    <span > Có hóa đơn mua hàng hợp lệ </span>
                                                        </li>
                                                        <li className = "flex items-start gap-2" >
                                                            <span className="text-green-500 mt-1" >✓</span>
                                                                <span > Trong thời gian quy định(30 ngày) </span>
                                                                    </li>
                                                                    </ul>
                                                                    </div>

                                                                    <div className = "space-y-3" >
                                                                        <h3 className="text-foreground font-bold" >🔄 Quy trình đổi trả </h3>
                                                                            <div className = "space-y-2" >
                                                                                <div className="flex gap-3" >
                                                                                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-foreground font-bold text-sm" > 1 </div>
                                                                                        <div >
                                                                                        <p className="text-foreground font-semibold" > Liên hệ </p>
                                                                                            <p className = "text-sm text-muted-foreground" > Gọi hotline hoặc gửi email yêu cầu đổi trả </p>
                                                                                                </div>
                                                                                                </div>
                                                                                                <div className = "flex gap-3" >
                                                                                                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-foreground font-bold text-sm" > 2 </div>
                                                                                                        <div >
                                                                                                        <p className="text-foreground font-semibold" > Gửi hàng </p>
                                                                                                            <p className = "text-sm text-muted-foreground" > Đóng gói và gửi sản phẩm về kho </p>
                                                                                                                </div>
                                                                                                                </div>
                                                                                                                <div className = "flex gap-3" >
                                                                                                                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-foreground font-bold text-sm" > 3 </div>
                                                                                                                        <div >
                                                                                                                        <p className="text-foreground font-semibold" > Kiểm tra </p>
                                                                                                                            <p className = "text-sm text-muted-foreground" > Chúng tôi kiểm tra sản phẩm(1 - 2 ngày) </p>
                                                                                                                                </div>
                                                                                                                                </div>
                                                                                                                                <div className = "flex gap-3" >
                                                                                                                                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-foreground font-bold text-sm" > 4 </div>
                                                                                                                                        <div >
                                                                                                                                        <p className="text-foreground font-semibold" > Hoàn tiền / Đổi hàng </p>
                                                                                                                                            <p className = "text-sm text-muted-foreground" > Nhận tiền hoặc sản phẩm mới(3 - 5 ngày) </p>
                                                                                                                                                </div>
                                                                                                                                                </div>
                                                                                                                                                </div>
                                                                                                                                                </div>

                                                                                                                                                <div className = "space-y-3" >
                                                                                                                                                    <h3 className="text-foreground font-bold" >💰 Chính sách hoàn tiền </h3>
                                                                                                                                                        <div className = "bg-muted border border-border rounded-lg p-4" >
                                                                                                                                                            <ul className="space-y-2 text-sm" >
                                                                                                                                                                <li className="flex items-center gap-2" >
                                                                                                                                                                    <span className="text-red-500" >•</span>
                                                                                                                                                                        <span > Hoàn 100 % nếu lỗi do nhà sản xuất </span>
                                                                                                                                                                            </li>
                                                                                                                                                                            <li className = "flex items-center gap-2" >
                                                                                                                                                                                <span className="text-red-500" >•</span>
                                                                                                                                                                                    <span > Hoàn 100 % nếu giao sai sản phẩm </span>
                                                                                                                                                                                        </li>
                                                                                                                                                                                        <li className = "flex items-center gap-2" >
                                                                                                                                                                                            <span className="text-red-500" >•</span>
                                                                                                                                                                                                <span > Phí vận chuyển 2 chiều do shop chịu </span>
                                                                                                                                                                                                    </li>
                                                                                                                                                                                                    </ul>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                    </div>

                                                                                                                                                                                                    <div className = "bg-red-900/20 border border-red-800 rounded-lg p-4" >
                                                                                                                                                                                                        <h3 className="text-foreground font-bold mb-2" >⚠️ Lưu ý </h3>
                                                                                                                                                                                                            <p className = "text-sm text-red-400" >
                                                                                                                                                                                                                Một số sản phẩm đặc biệt(dầu nhớt đã mở nắp, phụ tùng đã lắp đặt) không áp dụng đổi trả.
          </p>
                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                    </div>
    ),
},
shipping: {
    title: 'Chính sách vận chuyển',
        content: (
            <div className= "space-y-4 text-muted-foreground" >
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4" >
                <p className="text-foreground font-semibold" >
            🚚 Miễn phí vận chuyển cho đơn hàng từ 500.000đ
        </p>
        </div>

        <div className = "space-y-3" >
            <h3 className="text-foreground font-bold" >💵 Phí vận chuyển </h3>
                <div className = "bg-muted border border-border rounded-lg overflow-hidden" >
                    <div className="grid grid-cols-2 border-b border-border" >
                        <div className="p-3 bg-muted/50 font-semibold text-foreground" > Giá trị đơn hàng </div>
                            <div className = "p-3 bg-muted/50 font-semibold text-foreground" > Phí ship </div>
                                </div>
                                <div className = "grid grid-cols-2 border-b border-border" >
                                    <div className="p-3" > Từ 500.000đ trở lên </div>
                                        <div className = "p-3 text-green-500 font-semibold" > MIỄN PHÍ </div>
                                            </div>
                                            <div className = "grid grid-cols-2 border-b border-border" >
                                                <div className="p-3" > Từ 200.000đ - 499.000đ </div>
                                                    <div className = "p-3 text-red-500 font-semibold" > 30.000đ </div>
                                                        </div>
                                                        <div className = "grid grid-cols-2" >
                                                            <div className="p-3" > Dưới 200.000đ </div>
                                                                <div className = "p-3 text-red-500 font-semibold" > 50.000đ </div>
                                                                    </div>
                                                                    </div>
                                                                    </div>

                                                                    <div className = "space-y-3" >
                                                                        <h3 className="text-foreground font-bold" >⏱️ Thời gian giao hàng </h3>
                                                                            <div className = "space-y-2" >
                                                                                <div className="bg-muted border border-border rounded-lg p-3" >
                                                                                    <div className="flex justify-between items-center" >
                                                                                        <span className="text-foreground" > Nội thành TP.HCM </span>
                                                                                            <span className = "text-red-500 font-bold" > 1 - 2 ngày </span>
                                                                                                </div>
                                                                                                </div>
                                                                                                <div className = "bg-muted border border-border rounded-lg p-3" >
                                                                                                    <div className="flex justify-between items-center" >
                                                                                                        <span className="text-foreground" > Các tỉnh lân cận </span>
                                                                                                            <span className = "text-red-500 font-bold" > 2 - 3 ngày </span>
                                                                                                                </div>
                                                                                                                </div>
                                                                                                                <div className = "bg-muted border border-border rounded-lg p-3" >
                                                                                                                    <div className="flex justify-between items-center" >
                                                                                                                        <span className="text-foreground" > Tỉnh thành khác </span>
                                                                                                                            <span className = "text-red-500 font-bold" > 3 - 5 ngày </span>
                                                                                                                                </div>
                                                                                                                                </div>
                                                                                                                                <div className = "bg-muted border border-border rounded-lg p-3" >
                                                                                                                                    <div className="flex justify-between items-center" >
                                                                                                                                        <span className="text-foreground" > Vùng sâu, vùng xa </span>
                                                                                                                                            <span className = "text-red-500 font-bold" > 5 - 7 ngày </span>
                                                                                                                                                </div>
                                                                                                                                                </div>
                                                                                                                                                </div>
                                                                                                                                                </div>

                                                                                                                                                <div className = "space-y-3" >
                                                                                                                                                    <h3 className="text-foreground font-bold" >📦 Đơn vị vận chuyển </h3>
                                                                                                                                                        <div className = "grid grid-cols-2 gap-3" >
                                                                                                                                                            <div className="bg-muted border border-border rounded-lg p-3 text-center" >
                                                                                                                                                                <p className="text-foreground font-semibold" > Giao hàng nhanh </p>
                                                                                                                                                                    <p className = "text-xs text-muted-foreground mt-1" > Express delivery </p>
                                                                                                                                                                        </div>
                                                                                                                                                                        <div className = "bg-muted border border-border rounded-lg p-3 text-center" >
                                                                                                                                                                            <p className="text-foreground font-semibold" > Giao hàng tiết kiệm </p>
                                                                                                                                                                                <p className = "text-xs text-muted-foreground mt-1" > Economy shipping </p>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className = "bg-muted border border-border rounded-lg p-3 text-center" >
                                                                                                                                                                                        <p className="text-foreground font-semibold" > Viettel Post </p>
                                                                                                                                                                                            <p className = "text-xs text-muted-foreground mt-1" > Nationwide </p>
                                                                                                                                                                                                </div>
                                                                                                                                                                                                <div className = "bg-muted border border-border rounded-lg p-3 text-center" >
                                                                                                                                                                                                    <p className="text-foreground font-semibold" > Nhận tại cửa hàng </p>
                                                                                                                                                                                                        <p className = "text-xs text-muted-foreground mt-1" > Pick up </p>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            </div>

                                                                                                                                                                                                            <div className = "bg-yellow-900/20 border border-yellow-800 rounded-lg p-4" >
                                                                                                                                                                                                                <h3 className="text-foreground font-bold mb-2" >📋 Kiểm tra hàng khi nhận </h3>
                                                                                                                                                                                                                    <p className = "text-sm text-yellow-400" >
                                                                                                                                                                                                                        Quý khách vui lòng kiểm tra kỹ sản phẩm trước khi thanh toán.Nếu có vấn đề, vui lòng từ chối nhận hàng và liên hệ ngay với chúng tôi.
          </p>
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                            </div>
    ),
},
'shopping-guide': {
    title: 'Hướng dẫn mua hàng',
        content: (
            <div className= "space-y-4 text-muted-foreground" >
            <p className="text-lg" >
                Mua sắm tại <span className = "text-red-500 font-bold" > AutoParts </span> dễ dàng chỉ với 4 bước!
                    </p>

                    <div className = "space-y-4" >
                        <div className="flex gap-4" >
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-foreground font-bold text-xl" > 1 </div>
                                <div className = "flex-1" >
                                    <h3 className="text-foreground font-bold mb-2" > Tìm kiếm sản phẩm </h3>
                                        <div className = "bg-muted border border-border rounded-lg p-3" >
                                            <ul className="space-y-1 text-sm" >
                                                <li className="flex items-center gap-2" >
                                                    <span className="text-red-500" >→</span>
                                                        <span > Sử dụng thanh tìm kiếm hoặc duyệt danh mục </span>
                                                            </li>
                                                            <li className = "flex items-center gap-2" >
                                                                <span className="text-red-500" >→</span>
                                                                    <span > Lọc theo hãng xe, loại phụ tùng, giá cả </span>
                                                                        </li>
                                                                        <li className = "flex items-center gap-2" >
                                                                            <span className="text-red-500" >→</span>
                                                                                <span > Xem chi tiết và đánh giá sản phẩm </span>
                                                                                    </li>
                                                                                    </ul>
                                                                                    </div>
                                                                                    </div>
                                                                                    </div>

                                                                                    <div className = "flex gap-4" >
                                                                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-foreground font-bold text-xl" > 2 </div>
                                                                                            <div className = "flex-1" >
                                                                                                <h3 className="text-foreground font-bold mb-2" > Thêm vào giỏ hàng </h3>
                                                                                                    <div className = "bg-muted border border-border rounded-lg p-3" >
                                                                                                        <ul className="space-y-1 text-sm" >
                                                                                                            <li className="flex items-center gap-2" >
                                                                                                                <span className="text-red-500" >→</span>
                                                                                                                    <span > Chọn số lượng mong muốn </span>
                                                                                                                        </li>
                                                                                                                        <li className = "flex items-center gap-2" >
                                                                                                                            <span className="text-red-500" >→</span>
                                                                                                                                <span > Nhấn "Thêm vào giỏ" hoặc "Mua ngay" </span>
                                                                                                                                    </li>
                                                                                                                                    <li className = "flex items-center gap-2" >
                                                                                                                                        <span className="text-red-500" >→</span>
                                                                                                                                            <span > Tiếp tục mua sắm hoặc thanh toán </span>
                                                                                                                                                </li>
                                                                                                                                                </ul>
                                                                                                                                                </div>
                                                                                                                                                </div>
                                                                                                                                                </div>

                                                                                                                                                <div className = "flex gap-4" >
                                                                                                                                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-foreground font-bold text-xl" > 3 </div>
                                                                                                                                                        <div className = "flex-1" >
                                                                                                                                                            <h3 className="text-foreground font-bold mb-2" > Điền thông tin giao hàng </h3>
                                                                                                                                                                <div className = "bg-muted border border-border rounded-lg p-3" >
                                                                                                                                                                    <ul className="space-y-1 text-sm" >
                                                                                                                                                                        <li className="flex items-center gap-2" >
                                                                                                                                                                            <span className="text-red-500" >→</span>
                                                                                                                                                                                <span > Nhập đầy đủ họ tên, số điện thoại </span>
                                                                                                                                                                                    </li>
                                                                                                                                                                                    <li className = "flex items-center gap-2" >
                                                                                                                                                                                        <span className="text-red-500" >→</span>
                                                                                                                                                                                            <span > Địa chỉ nhận hàng chính xác </span>
                                                                                                                                                                                                </li>
                                                                                                                                                                                                <li className = "flex items-center gap-2" >
                                                                                                                                                                                                    <span className="text-red-500" >→</span>
                                                                                                                                                                                                        <span > Ghi chú thêm nếu cần(giờ giao, vị trí...) </span>
                                                                                                                                                                                                            </li>
                                                                                                                                                                                                            </ul>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            </div>

                                                                                                                                                                                                            <div className = "flex gap-4" >
                                                                                                                                                                                                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-foreground font-bold text-xl" > 4 </div>
                                                                                                                                                                                                                    <div className = "flex-1" >
                                                                                                                                                                                                                        <h3 className="text-foreground font-bold mb-2" > Thanh toán & Nhận hàng </h3>
                                                                                                                                                                                                                            <div className = "bg-muted border border-border rounded-lg p-3" >
                                                                                                                                                                                                                                <ul className="space-y-1 text-sm" >
                                                                                                                                                                                                                                    <li className="flex items-center gap-2" >
                                                                                                                                                                                                                                        <span className="text-red-500" >→</span>
                                                                                                                                                                                                                                            <span > Chọn phương thức thanh toán </span>
                                                                                                                                                                                                                                                </li>
                                                                                                                                                                                                                                                <li className = "flex items-center gap-2" >
                                                                                                                                                                                                                                                    <span className="text-red-500" >→</span>
                                                                                                                                                                                                                                                        <span > Xác nhận đơn hàng </span>
                                                                                                                                                                                                                                                            </li>
                                                                                                                                                                                                                                                            <li className = "flex items-center gap-2" >
                                                                                                                                                                                                                                                                <span className="text-red-500" >→</span>
                                                                                                                                                                                                                                                                    <span > Nhận hàng và kiểm tra kỹ </span>
                                                                                                                                                                                                                                                                        </li>
                                                                                                                                                                                                                                                                        </ul>
                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                        <div className = "bg-green-900/20 border border-green-800 rounded-lg p-4" >
                                                                                                                                                                                                                                                                            <h3 className="text-foreground font-bold mb-2" >💡 Mẹo mua hàng </h3>
                                                                                                                                                                                                                                                                                <ul className = "space-y-1 text-sm text-green-400" >
                                                                                                                                                                                                                                                                                    <li>• Đăng ký tài khoản để tích điểm và nhận ưu đãi </li>
                                                                                                                                                                                                                                                                                        <li>• Theo dõi fanpage để cập nhật khuyến mãi mới nhất </li>
                                                                                                                                                                                                                                                                                            <li>• Liên hệ tư vấn trước khi mua nếu chưa chắc chắn </li>
                                                                                                                                                                                                                                                                                                </ul>
                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                </div>
    ),
},
faq: {
    title: 'Câu hỏi thường gặp',
        content: (
            <div className= "space-y-4 text-muted-foreground" >
            <div className="space-y-3" >
                <div className="bg-muted border border-border rounded-lg overflow-hidden" >
                    <div className="bg-red-900/30 border-b border-border p-4" >
                        <h3 className="text-foreground font-bold" >❓ Sản phẩm có chính hãng 100 % không ? </h3>
                            </div>
                            <div className = "p-4" >
                                <p className="text-sm" >
                                    Có.Tất cả sản phẩm tại AutoParts đều là hàng chính hãng, có tem bảo hành và CO / CQ đầy đủ. 
                Chúng tôi cam kết hoàn tiền 200 % nếu phát hiện hàng giả.
              </p>
        </div>
        </div>

        <div className = "bg-muted border border-border rounded-lg overflow-hidden" >
            <div className="bg-red-900/30 border-b border-border p-4" >
                <h3 className="text-foreground font-bold" >❓ Làm sao để biết phụ tùng phù hợp với xe ? </h3>
                    </div>
                    <div className = "p-4" >
                        <p className="text-sm" >
                            Bạn có thể sử dụng bộ lọc tìm kiếm theo hãng xe và model.Hoặc liên hệ hotline
                                <span className = "text-red-500 font-bold" > 1900 xxxx </span> để được tư vấn miễn phí từ kỹ thuật viên chuyên nghiệp.
                                    </p>
                                    </div>
                                    </div>

                                    <div className = "bg-muted border border-border rounded-lg overflow-hidden" >
                                        <div className="bg-red-900/30 border-b border-border p-4" >
                                            <h3 className="text-foreground font-bold" >❓ Có dịch vụ lắp đặt tận nhà không ? </h3>
                                                </div>
                                                <div className = "p-4" >
                                                    <p className="text-sm" >
                                                        Có.Chúng tôi có đội ngũ kỹ thuật viên sẵn sàng đến tận nơi lắp đặt cho các sản phẩm phức tạp. 
                Phí dịch vụ từ 100.000đ tùy khu vực và loại sản phẩm.
              </p>
        </div>
        </div>

        <div className = "bg-muted border border-border rounded-lg overflow-hidden" >
            <div className="bg-red-900/30 border-b border-border p-4" >
                <h3 className="text-foreground font-bold" >❓ Thanh toán như thế nào ? </h3>
                    </div>
                    <div className = "p-4" >
                        <p className="text-sm mb-2" > Chúng tôi hỗ trợ nhiều phương thức thanh toán: </p>
                            <ul className = "space-y-1 text-sm list-disc list-inside" >
                                <li>COD(Thanh toán khi nhận hàng) </li>
                                <li > Chuyển khoản ngân hàng </li>
                                    <li > Ví điện tử(MoMo, ZaloPay, VNPay) </li>
                                        <li > Quẹt thẻ tại cửa hàng </li>
                                            </ul>
                                            </div>
                                            </div>

                                            <div className = "bg-muted border border-border rounded-lg overflow-hidden" >
                                                <div className="bg-red-900/30 border-b border-border p-4" >
                                                    <h3 className="text-foreground font-bold" >❓ Có được đổi trả nếu không vừa ? </h3>
                                                        </div>
                                                        <div className = "p-4" >
                                                            <p className="text-sm" >
                                                                Có.Bạn được đổi trả miễn phí trong vòng 30 ngày nếu sản phẩm chưa sử dụng, còn nguyên tem mác. 
                Xem chi tiết tại mục <span className = "text-red-500 font-semibold" > Chính sách đổi trả </span>.
        </p>
        </div>
        </div>

        <div className = "bg-muted border border-border rounded-lg overflow-hidden" >
            <div className="bg-red-900/30 border-b border-border p-4" >
                <h3 className="text-foreground font-bold" >❓ Làm thế nào để kiểm tra bảo hành ? </h3>
                    </div>
                    <div className = "p-4" >
                        <p className="text-sm" >
                            Mỗi sản phẩm có mã tem bảo hành riêng.Bạn có thể tra cứu trên website hoặc gọi hotline 
                để kiểm tra thông tin bảo hành và thời gian còn lại.
              </p>
        </div>
        </div>
        </div>

        <div className = "bg-blue-900/20 border border-blue-800 rounded-lg p-4" >
            <h3 className="text-foreground font-bold mb-2" >💬 Vẫn còn thắc mắc ? </h3>
                <p className = "text-sm text-blue-400 mb-2" >
                    Liên hệ ngay với chúng tôi qua:
    </p>
        <div className = "flex flex-col gap-1 text-sm" >
            <p className="text-sm"> Hotline: <span className="text-red-500 font-bold"> 1900 xxxx </span></p>
<p className="text-sm"> Email: <span className="text-foreground"> warranty@autoparts.vn</span></p>
                    </div>
                    </div>
                    </div>
    ),
},
payment: {
    title: 'Thanh toán',
        content: (
            <div className= "space-y-4 text-muted-foreground" >
            <p className="text-lg" >
                AutoParts hỗ trợ <span className = "text-red-500 font-bold" > đa dạng phương thức thanh toán </span> để bạn dễ dàng lựa chọn
                    </p>

                    <div className = "space-y-3" >
                        <div className="bg-muted border border-border rounded-lg p-4" >
                            <div className="flex items-center gap-3 mb-3" >
                                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center" >
                                    <span className="text-xl" >💵</span>
                                        </div>
                                        <h3 className = "text-foreground font-bold" > COD - Thanh toán khi nhận hàng </h3>
                                            </div>
                                            <ul className = "space-y-1 text-sm ml-13" >
                                                <li className="flex items-center gap-2" >
                                                    <span className="text-green-500" >✓</span>
                                                        <span > Kiểm tra hàng trước khi thanh toán </span>
                                                            </li>
                                                            <li className = "flex items-center gap-2" >
                                                                <span className="text-green-500" >✓</span>
                                                                    <span > An toàn, tin cậy </span>
                                                                        </li>
                                                                        <li className = "flex items-center gap-2" >
                                                                            <span className="text-red-500" >•</span>
                                                                                <span className="text-muted-foreground"> Phí COD: 15.000đ(miễn phí cho đơn &gt; 1 triệu) </span>
                                                                                    </li>
                                                                                    </ul>
                                                                                    </div>

                                                                                    <div className = "bg-muted border border-border rounded-lg p-4" >
                                                                                        <div className="flex items-center gap-3 mb-3" >
                                                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center" >
                                                                                                <span className="text-xl" >🏦</span>
                                                                                                    </div>
                                                                                                    <h3 className = "text-foreground font-bold" > Chuyển khoản ngân hàng </h3>
                                                                                                        </div>
                                                                                                        <div className = "space-y-2 ml-13" >
                                                                                                            <p className="text-sm" > Thông tin tài khoản: </p>
                                                                                                                <div className = "bg-card border border-border rounded p-3 text-sm" >
                                                                                                                    <p className="text-foreground font-semibold" > Ngân hàng: Vietcombank </p>
                                                                                                                        <p className="text-foreground"> STK: <span className="font-mono bg-muted px-2 py-1 rounded"> 123 456 789 012 </span></p>
                                                                                                                            <p className="text-foreground" > Chủ TK: CÔNG TY TNHH AUTOPARTS </p>
                                                                                                                                <p className = "text-muted-foreground text-xs mt-2" > Nội dung: [Số điện thoại][Mã đơn hàng]</p>
                                                                                                                                    </div>
                                                                                                                                    <p className = "text-xs text-yellow-400" >💡 Đơn hàng sẽ được xử lý sau 5 - 10 phút nhận được tiền </p>
                                                                                                                                        </div>
                                                                                                                                        </div>

                                                                                                                                        <div className = "bg-muted border border-border rounded-lg p-4" >
                                                                                                                                            <div className="flex items-center gap-3 mb-3" >
                                                                                                                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center" >
                                                                                                                                                    <span className="text-xl" >📱</span>
                                                                                                                                                        </div>
                                                                                                                                                        <h3 className = "text-foreground font-bold" > Ví điện tử </h3>
                                                                                                                                                            </div>
                                                                                                                                                            <div className = "ml-13" >
                                                                                                                                                                <div className="grid grid-cols-3 gap-2" >
                                                                                                                                                                    <div className="bg-purple-900/30 border border-purple-800 rounded-lg p-2 text-center" >
                                                                                                                                                                        <div className="text-2xl mb-1" >💜</div>
                                                                                                                                                                            <div className = "text-xs text-foreground font-semibold" > MoMo </div>
                                                                                                                                                                                </div>
                                                                                                                                                                                <div className = "bg-blue-900/30 border border-blue-800 rounded-lg p-2 text-center" >
                                                                                                                                                                                    <div className="text-2xl mb-1" >💙</div>
                                                                                                                                                                                        <div className = "text-xs text-foreground font-semibold" > ZaloPay </div>
                                                                                                                                                                                            </div>
                                                                                                                                                                                            <div className = "bg-red-900/30 border border-red-800 rounded-lg p-2 text-center" >
                                                                                                                                                                                                <div className="text-2xl mb-1" >❤️</div>
                                                                                                                                                                                                    <div className = "text-xs text-foreground font-semibold" > VNPay </div>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                                        <p className = "text-xs text-muted-foreground mt-2" >✓ Thanh toán nhanh chóng, bảo mật cao </p>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            </div>

                                                                                                                                                                                                            <div className = "bg-muted border border-border rounded-lg p-4" >
                                                                                                                                                                                                                <div className="flex items-center gap-3 mb-3" >
                                                                                                                                                                                                                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg flex items-center justify-center" >
                                                                                                                                                                                                                        <span className="text-xl" >💳</span>
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                            <h3 className = "text-foreground font-bold" > Quẹt thẻ tại cửa hàng </h3>
                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                <ul className = "space-y-1 text-sm ml-13" >
                                                                                                                                                                                                                                    <li className="flex items-center gap-2" >
                                                                                                                                                                                                                                        <span className="text-yellow-500" >✓</span>
                                                                                                                                                                                                                                            <span > Hỗ trợ thẻ Visa, Mastercard, JCB </span>
                                                                                                                                                                                                                                                </li>
                                                                                                                                                                                                                                                <li className = "flex items-center gap-2" >
                                                                                                                                                                                                                                                    <span className="text-yellow-500" >✓</span>
                                                                                                                                                                                                                                                        <span > Thanh toán trực tiếp khi nhận hàng tại shop </span>
                                                                                                                                                                                                                                                            </li>
                                                                                                                                                                                                                                                            </ul>
                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                            <div className = "bg-muted border border-border rounded-lg p-4" >
                                                                                                                                                                                                                                                                <div className="flex items-center gap-3 mb-3" >
                                                                                                                                                                                                                                                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg flex items-center justify-center" >
                                                                                                                                                                                                                                                                        <span className="text-xl" >🔄</span>
                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                            <h3 className = "text-foreground font-bold" > Trả góp qua thẻ tín dụng </h3>
                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                <ul className = "space-y-1 text-sm ml-13" >
                                                                                                                                                                                                                                                                                    <li className="flex items-center gap-2" >
                                                                                                                                                                                                                                                                                        <span className="text-orange-500" >✓</span>
                                                                                                                                                                                                                                                                                            <span > Áp dụng cho đơn hàng từ 3 triệu trở lên </span>
                                                                                                                                                                                                                                                                                                </li>
                                                                                                                                                                                                                                                                                                <li className = "flex items-center gap-2" >
                                                                                                                                                                                                                                                                                                    <span className="text-orange-500" >✓</span>
                                                                                                                                                                                                                                                                                                        <span > Lãi suất 0 % (3 - 6 tháng)</span>
                                                                                                                                                                                                                                                                                                            </li>
                                                                                                                                                                                                                                                                                                            <li className = "flex items-center gap-2" >
                                                                                                                                                                                                                                                                                                                <span className="text-orange-500" >✓</span>
                                                                                                                                                                                                                                                                                                                    <span > Duyệt nhanh chóng </span>
                                                                                                                                                                                                                                                                                                                        </li>
                                                                                                                                                                                                                                                                                                                        </ul>
                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                        <div className = "bg-green-900/20 border border-green-800 rounded-lg p-4" >
                                                                                                                                                                                                                                                                                                                            <h3 className="text-foreground font-bold mb-2" >🔒 Bảo mật thanh toán </h3>
                                                                                                                                                                                                                                                                                                                                <p className = "text-sm text-green-400" >
                                                                                                                                                                                                                                                                                                                                    Tất cả giao dịch đều được mã hóa SSL 256 - bit, đảm bảo an toàn tuyệt đối cho thông tin khách hàng.
          </p>
                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                        </div>
    ),
},
};
