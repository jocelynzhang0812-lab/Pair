import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../common/current-user.decorator';
import { UpdatePublicPageDto } from './dto';
import { PublicPagesService } from './public-pages.service';

@Controller()
export class PublicPagesController {
  constructor(private readonly publicPages: PublicPagesService) {}

  @Get('u/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return { data: await this.publicPages.getBySlug(slug) };
  }

  @Get('public-pages/me')
  @UseGuards(JwtAuthGuard)
  async getMine(@CurrentUser() user: AuthenticatedUser) {
    return { data: await this.publicPages.getMine(user.id) };
  }

  @Patch('public-pages/me')
  @UseGuards(JwtAuthGuard)
  async updateMine(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdatePublicPageDto) {
    return { data: await this.publicPages.updateMine(user.id, body) };
  }
}
