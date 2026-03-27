import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProfileListService } from './profile-list.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileListController {
  constructor(private readonly service: ProfileListService) {}

  // GET /api/profile/list?viewerProfileId=xxx
  @Get('list/:viewerProfileId')
  getList(@Param('viewerProfileId') viewerProfileId: string) {
    return this.service.getVisibleProfiles(viewerProfileId);
  }
}
