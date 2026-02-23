import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomerService } from './customer.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('customers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
        return this.customerService.findAll(+page, +limit);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.customerService.findById(id);
    }
}
