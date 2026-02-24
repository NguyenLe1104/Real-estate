import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
    Ip,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, VNPayCallbackDto, MoMoCallbackDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) { }

    // ==================== PAYMENT GATEWAY CALLBACKS (must be before :id routes) ====================

    @Get('vnpay/callback')
    async vnpayCallback(@Query() query: VNPayCallbackDto, @Res() res: Response) {
        const result = await this.paymentService.handleVNPayCallback(query);

        // Redirect về frontend với kết quả (HTTP 302 thực sự)
        const redirectUrl = result.success
            ? `${process.env.FRONTEND_URL}/payment/success`
            : `${process.env.FRONTEND_URL}/payment/failed`;

        return res.redirect(302, redirectUrl);
    }

    @Post('vnpay/ipn')
    async vnpayIPN(@Body() body: any) {
        // IPN (Instant Payment Notification) từ VNPay
        return this.paymentService.handleVNPayCallback(body);
    }

    @Get('momo/callback')
    async momoCallback(@Query() query: MoMoCallbackDto, @Res() res: Response) {
        const result = await this.paymentService.handleMoMoCallback(query);

        // Redirect về frontend với kết quả (HTTP 302 thực sự)
        const redirectUrl = result.success
            ? `${process.env.FRONTEND_URL}/payment/success`
            : `${process.env.FRONTEND_URL}/payment/failed`;

        return res.redirect(302, redirectUrl);
    }

    @Post('momo/notify')
    async momoNotify(@Body() body: MoMoCallbackDto) {
        // IPN từ MoMo
        const result = await this.paymentService.handleMoMoCallback(body);

        // MoMo yêu cầu response với format cụ thể
        return {
            partnerCode: body.partnerCode,
            orderId: body.orderId,
            requestId: body.requestId,
            resultCode: result.success ? 0 : 1,
            message: result.message,
        };
    }

    // ==================== USER ROUTES ====================

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createPayment(
        @Body() dto: CreatePaymentDto,
        @Request() req,
        @Ip() ip: string,
    ) {
        return this.paymentService.createPayment(dto, req.user.id, ip);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    async getMyPayments(
        @Request() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.paymentService.getMyPayments(
            req.user.id,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 10,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getPaymentById(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        return this.paymentService.getPaymentById(id, req.user.id);
    }

    // ==================== MOCK PAYMENT SUCCESS (FOR TESTING) ====================

    @UseGuards(JwtAuthGuard)
    @Post(':id/simulate-success')
    async simulatePaymentSuccess(
        @Param('id', ParseIntPipe) paymentId: number,
        @Request() req,
    ) {
        return this.paymentService.simulatePaymentSuccess(paymentId, req.user.id);
    }
}
