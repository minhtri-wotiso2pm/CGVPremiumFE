import React from "react";
import { QRCodeSVG } from "qrcode.react"; 


interface BookingSuccessProps {
    bookingData: {
        movieTitle: string;
        movieImage: string;
        cinemaName: string;
        showTime: string;
        roomName: string;
        seats: string[];
        bookingCode: string; // Chuỗi dùng để sinh mã QR 
        ticketCount: number;
        ticketPrice: number;
        fnbTotal: number;
        discount: number;
        totalAmount: number;
    };
    onBackToHome: () => void;
}

const BookingSuccessPage: React.FC<BookingSuccessProps> = ({ bookingData, onBackToHome }) => {
    const {
        movieTitle,
        movieImage,
        cinemaName,
        showTime,
        roomName,
        seats,
        bookingCode,
        ticketCount,
        ticketPrice,
        fnbTotal,
        discount,
        totalAmount
    } = bookingData;

    
    const qrValue = bookingCode;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
            {/* Header / Tiêu đề thành công */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 text-red-500 mb-4 border border-red-500/30">
                    <span className="text-2xl">✓</span>
                </div>
                <h1 className="text-3xl font-bold tracking-wider mb-2">THANH TOÁN THÀNH CÔNG</h1>
                <p className="text-gray-400 text-sm">
                    Chúc mừng! Bạn đã đặt vé thành công. Vui lòng kiểm tra chi tiết vé điện tử của bạn dưới đây.
                </p>
            </div>

            {/* Khung nội dung chính */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* BÊN TRÁI: Thông tin Phim & Vé */}
                <div className="md:col-span-7 bg-[#121212] rounded-xl overflow-hidden border border-zinc-800 flex h-[320px]">
                    {/* Ảnh Poster phim */}
                    <div className="w-1/3 relative">
                        <img src={movieImage} alt={movieTitle} className="w-full h-full object-cover" />
                        <span className="absolute bottom-4 left-4 bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                            IMAX 2D
                        </span>
                    </div>

                    {/* Chi tiết suất chiếu */}
                    <div className="w-2/3 p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">{movieTitle}</h2>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs text-gray-400">
                                <div>
                                    <p className="text-[10px] uppercase text-zinc-500">Rạp</p>
                                    <p className="font-semibold text-zinc-200">{cinemaName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-zinc-500">Thời gian</p>
                                    <p className="font-semibold text-zinc-200">{showTime}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-zinc-500">Phòng chiếu</p>
                                    <p className="font-semibold text-zinc-200">{roomName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-zinc-500">Chỗ ngồi</p>
                                    <p className="font-semibold text-red-400">{seats.join(", ")}</p>
                                </div>
                            </div>
                        </div>

                        {/* Mã đặt vé */}
                        <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] uppercase text-zinc-500">Mã đặt vé</p>
                                <p className="text-xl font-mono font-bold tracking-widest text-zinc-100">{bookingCode}</p>
                            </div>
                            {/* Icon barcode trang trí */}
                            <div className="opacity-30 text-2xl">|||</div>
                        </div>
                    </div>
                </div>

                {/* BÊN PHẢI: Mã QR & Tổng tiền */}
                <div className="md:col-span-5 flex flex-col gap-6">
                    {/* Khung chứa mã QR */}
                    <div className="bg-[#121212] rounded-xl p-6 border border-zinc-800 text-center flex flex-col items-center justify-center">
                        <div className="bg-white p-4 rounded-xl inline-block mb-4">
                            {/* Thư viện sinh mã QR ở đây */}
                            <QRCodeSVG 
                                value={qrValue} 
                                size={150} // Kích thước mã QR (px)
                                bgColor="#FFFFFF" 
                                fgColor="#000000" 
                                level="H" // Độ chống nhiễu cao giúp camera quét cực nhạy
                            />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">Quét mã để vào rạp</h3>
                        <p className="text-xs text-gray-500 max-w-[200px]">
                            Vui lòng xuất trình mã này tại quầy vé hoặc cửa rạp
                        </p>
                    </div>

                    {/* Khung Tóm tắt thanh toán */}
                    <div className="bg-[#121212] rounded-xl p-6 border border-zinc-800 text-xs">
                        <h4 className="text-[10px] uppercase text-zinc-500 font-bold mb-4 tracking-wider">Tóm tắt thanh toán</h4>
                        <div className="space-y-2 text-zinc-400">
                            <div className="flex justify-between">
                                <span>Giá vé (x{ticketCount})</span>
                                <span className="font-mono text-zinc-200">{ticketPrice.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Bắp nước</span>
                                <span className="font-mono text-zinc-200">{fnbTotal.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Giảm giá thành viên</span>
                                <span className="font-mono text-green-500">-{discount.toLocaleString()}đ</span>
                            </div>
                            <hr className="border-zinc-800 my-2" />
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span>Tổng cộng</span>
                                <span className="text-red-500 font-mono text-base">{totalAmount.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4 mt-12">
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-8 py-3 rounded-lg transition">
                    📥 Tải vé về máy
                </button>
                <button 
                    onClick={onBackToHome}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs px-8 py-3 rounded-lg transition"
                >
                    🏠 Về trang chủ
                </button>
            </div>
        </div>
    );
};

export default BookingSuccessPage;