import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VNPayService {
    private vnp_TmnCode: string;
    private vnp_HashSecret: string;
    private vnp_Url: string;
    private vnp_ReturnUrl: string;

    constructor(private configService: ConfigService) {
        // Lấy từ .env file
        this.vnp_TmnCode = this.configService.get('VNPAY_TMN_CODE') || '9CS3IU3N';
        this.vnp_HashSecret = this.configService.get('VNPAY_HASH_SECRET') || '3WDE5U7C8XPS6ICTGRM4KEEIABLY42ED';
        this.vnp_Url = this.configService.get('VNPAY_URL') || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        this.vnp_ReturnUrl = this.configService.get('VNPAY_RETURN_URL') || 'http://localhost:5000/api/payment/vnpay/callback';
    }

    createPaymentUrl(
        orderId: string,
        amount: number,
        orderInfo: string,
        ipAddr: string,
        returnUrl?: string,
    ): string {
        // VNPay yêu cầu thời gian theo múi giờ Việt Nam (GMT+7)
        const now = new Date();
        const createDate = this.formatDateTime(now);
        const expireDate = this.formatDateTime(
            new Date(now.getTime() + 30 * 60 * 1000)
        ); // 30 phút

        // Chuẩn hóa IP address - loại bỏ IPv6 prefix
        let cleanIp = ipAddr || '127.0.0.1';
        if (cleanIp.includes('::ffff:')) {
            cleanIp = cleanIp.replace('::ffff:', '');
        }

        const vnp_Params: Record<string, string | number> = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.round(amount * 100);
        vnp_Params['vnp_ReturnUrl'] = returnUrl || this.vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = cleanIp;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;

        // Sắp xếp và TỰ ĐỘNG ENCODE params theo chuẩn VNPay
        const sortedParams = this.sortObject(vnp_Params);

        // Build signData - lúc này các value trong sortedParams đã được encode chuẩn
        const signData = Object.keys(sortedParams)
            .map(key => `${key}=${sortedParams[key]}`)
            .join('&');

        console.log('🔍 VNPay SignData:', signData);
        console.log('🔑 VNPay HashSecret:', this.vnp_HashSecret);
        const secureHash = this.createHmacSha512(signData, this.vnp_HashSecret);
        console.log('🔐 VNPay SecureHash:', secureHash);

        // Nối thẳng chuỗi truy vấn, KHÔNG DÙNG URLSearchParams nữa
        const paymentUrl = `${this.vnp_Url}?${signData}&vnp_SecureHash=${secureHash}`;

        return paymentUrl;
    }

    verifyReturnUrl(vnp_Params: any): { isValid: boolean; responseCode: string } {
        const secureHash = vnp_Params['vnp_SecureHash'];

        // Xóa các field hash ra khỏi params trước khi verify
        const params = { ...vnp_Params };
        delete params['vnp_SecureHash'];
        delete params['vnp_SecureHashType'];

        const sortedParams = this.sortObject(params);
        // Verify cũng dùng qs.stringify no encode để match
        const signData = qs.stringify(sortedParams, { encode: false });
        const checkSum = this.createHmacSha512(signData, this.vnp_HashSecret);

        return {
            isValid: secureHash === checkSum,
            responseCode: vnp_Params['vnp_ResponseCode'],
        };
    }

    private formatDateTime(date: Date): string {
        // VNPay yêu cầu múi giờ Việt Nam (UTC+7)
        // Docker container chạy UTC nên cần cộng thêm 7 tiếng
        const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        const year = vnDate.getUTCFullYear();
        const month = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(vnDate.getUTCDate()).padStart(2, '0');
        const hour = String(vnDate.getUTCHours()).padStart(2, '0');
        const minute = String(vnDate.getUTCMinutes()).padStart(2, '0');
        const second = String(vnDate.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hour}${minute}${second}`;
    }

    private sortObject(obj: Record<string, any>): Record<string, string> {
        const sorted: Record<string, string> = {};

        // Lấy danh sách các key, sắp xếp theo bảng chữ cái
        const keys = Object.keys(obj).sort();

        // Lặp qua từng key để đưa vào object mới
        for (const key of keys) {
            // Encode cả key lẫn value, đồng thời replace khoảng trắng (%20) thành dấu +
            const encodedKey = encodeURIComponent(key);
            const encodedValue = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');

            sorted[encodedKey] = encodedValue;
        }

        return sorted;
    }

    private createHmacSha512(data: string, secret: string): string {
        return crypto.createHmac('sha512', secret).update(Buffer.from(data, 'utf-8')).digest('hex');
    }
}
