import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GroupMeassageDto } from './dto/group-meassage.dto';
import { GroupMeassageChatDto } from './dto/group-chat.dto';

@Controller('group')
export class GroupController {
    constructor(private groupservice: GroupService) {}
    //TODO-1: create group, join group, leave group, meassage to group, search group, get group chat --> completed
    //TODO-2: create unigue string for perticular group to send for joining, --> when creating group
    //TODO-3: delete group by owner only, and give ownership

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async create_group(@Request() req, @Body('group_name') group_name: string) {
        return this.groupservice.create_group(req.user, group_name);
    }

    @UseGuards(JwtAuthGuard)
    @Post('join')
    async join_group(@Request() req, @Body('group_id') group_id: number) {
        return this.groupservice.join_group(req.user, group_id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('leave')
    async leave_group(@Request() req, @Body('group_id') group_id: number) {
        return this.groupservice.leave_group(req.user, group_id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('meassage')
    async meassage_group(@Request() req, @Body() dto: GroupMeassageDto) {
        //will require which group is meassaging, which user has meassaged, and the meassage string,
        return this.groupservice.meassaging_group(req.user, dto);
    }

    @Get()
    async get_group() {
        // will show the group based on that group string
        // this is for invitation of group to one to one
    }

    @UseGuards(JwtAuthGuard)
    @Get('meassage')
    async get_group_meassage(
        @Request() req,
        @Body('group_id') group_id: number,
    ) {
        return this.groupservice.get_group_meassage(req.user, group_id);
    }

    //TODO: Delete meassage from group --> Pending
    @UseGuards(JwtAuthGuard)
    @Delete('meassage')
    async delete_meassage_group(
        @Request() req,
        @Body() dto: GroupMeassageChatDto,
    ) {
        return this.groupservice.delete_meassage_group(req.user, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async delete_group(@Request() req, @Body('group_id') group_id: number) {
        return this.groupservice.delete_group(req.user, group_id);
    }
}
